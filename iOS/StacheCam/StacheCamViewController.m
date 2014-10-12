
/*
 <codex/>
 */

#ifndef __CODEX__
/*
 $Log$
 12jun2012 etirathompson
 Updates for AVCaptureMetadataOutput-based face detection
 
 14jun2011 bford
 Now that the fix for <rdar://problem/9556918> is checked in, allow mustache insertion in scale and
 cropped pictures (use BGRA and do the compositing).
 
 07jun2011 bford
 Renamed _ prefixed methods.
 
 6jun2011 bford
 ___CODEX__ -> __CODEX__.  Be careful whom you copy/paste from.
 
 6jun2011 bford
 first time.
 */ 
#endif

#import "StacheCamViewController.h"
#import <AssertMacros.h>
#import <AssetsLibrary/AssetsLibrary.h>
#import "StacheCamViewController+CIFaceDetection.h"
#import "StacheCamViewController+AVFFaceDetection.h"
#import "UserDefaults.h"
#import "Frame.h"
#import "AFNetworking.h"
#import "MBProgressHUD.h"

static char * const AVCaptureStillImageIsCapturingStillImageContext = "AVCaptureStillImageIsCapturingStillImageContext";
const CGFloat FACE_RECT_BORDER_WIDTH = 3;

CGFloat DegreesToRadians(CGFloat degrees) {return degrees * M_PI / 180;}

static CGFloat angleOffsetFromPortraitOrientationToOrientation(AVCaptureVideoOrientation orientation)
{
    CGFloat angle = 0.0;
    
    switch (orientation) {
        case AVCaptureVideoOrientationPortrait:
            angle = 0.0;
            break;
        case AVCaptureVideoOrientationPortraitUpsideDown:
            angle = M_PI;
            break;
        case AVCaptureVideoOrientationLandscapeRight:
            angle = -M_PI_2;
            break;
        case AVCaptureVideoOrientationLandscapeLeft:
            angle = M_PI_2;
            break;
        default:
            break;
    }
    
    return angle;
}

@interface StacheCamViewController() {
	UIView *flashView;
	CGFloat beginGestureScale;
}
@property (strong, nonatomic) AVCaptureSession* session;
@property (strong, nonatomic) AVCaptureVideoPreviewLayer *previewLayer;
@property (assign, nonatomic) CGFloat effectiveScale;
@property (strong, nonatomic) NSURL* recordingURL;
@property (readwrite) AVCaptureVideoOrientation recordingOrientation; // client can set the orientation for the recorded movie
@property (strong, nonatomic) AVCaptureDevice* videoDevice;
@end

@implementation StacheCamViewController

@synthesize frames = _frames;
@synthesize startTime = _startTime;
@synthesize movieRecorder = _movieRecorder;
@synthesize videoRecordingStatus = _videoRecordingStatus;
@synthesize recognizer = _recognizer;

- (id)initWithCoder:(NSCoder *)aDecoder {
    self = [super initWithCoder:aDecoder];
    if (self) {
        _frames = [[NSMutableArray alloc] init];
        _videoRecordingStatus = VideoRecordingStatusIdle;
        _recordingURL = [[NSURL alloc] initFileURLWithPath:[NSString pathWithComponents:@[NSTemporaryDirectory(), @"Movie.MOV"]]];
        _recordingOrientation = (AVCaptureVideoOrientation)UIDeviceOrientationPortrait;
    }
    return self;
}

- (void)setupAVCapture
{
	self.session = [AVCaptureSession new];
	[self.session setSessionPreset:AVCaptureSessionPresetPhoto]; // high-res stills, screen-size video
	
	[self updateCameraSelection];
	
	// For displaying live feed to screen
	CALayer *rootLayer = self.previewView.layer;
	[rootLayer setMasksToBounds:YES];
	self.previewLayer = [[AVCaptureVideoPreviewLayer alloc] initWithSession:self.session];
	[self.previewLayer setBackgroundColor:[[UIColor blackColor] CGColor]];
	[self.previewLayer setVideoGravity:AVLayerVideoGravityResizeAspect];
	[self.previewLayer setFrame:[rootLayer bounds]];
	[rootLayer addSublayer:self.previewLayer];
	
	// For receiving AV Foundation face detection
	[self setupAVFoundationFaceDetection];

	// For comparing to the CoreImage face detection
	[self setupCoreImageFaceDetection];

	[self.session startRunning];
}
					
- (void)teardownAVCapture
{
	[self.session stopRunning];
		
	[self teardownCoreImageFaceDetection];
	[self teardownAVFoundationFaceDetection];
	
	[self.previewLayer removeFromSuperlayer];
	self.previewLayer = nil;
	
	self.session = nil;
}

- (AVCaptureDeviceInput*) pickCamera
{
	AVCaptureDevicePosition desiredPosition = (UserDefaults.usingFrontCamera) ? AVCaptureDevicePositionFront : AVCaptureDevicePositionBack;
	BOOL hadError = NO;
	for (AVCaptureDevice *d in [AVCaptureDevice devicesWithMediaType:AVMediaTypeVideo]) {
		if ([d position] == desiredPosition) {
			NSError *error = nil;
			AVCaptureDeviceInput *input = [AVCaptureDeviceInput deviceInputWithDevice:d error:&error];
			if (error) {
				hadError = YES;
				displayErrorOnMainQueue(error, @"Could not initialize for AVMediaTypeVideo");
			} else if ( [self.session canAddInput:input] ) {
                self.videoDevice = d;
				return input;
			}
		}
	}
	if ( ! hadError ) {
		// no errors, simply couldn't find a matching camera
		displayErrorOnMainQueue(nil, @"No camera found for requested orientation");
	}
	return nil;
}

- (void) updateCameraSelection
{
	// Changing the camera device will reset connection state, so we call the
	// update*Detection functions to resync them.  When making multiple
	// session changes, wrap in a beginConfiguration / commitConfiguration.
	// This will avoid consecutive session restarts for each configuration
	// change (noticeable delay and camera flickering)
	
	[self.session beginConfiguration];
	
	// have to remove old inputs before we test if we can add a new input
	NSArray* oldInputs = [self.session inputs];
	for (AVCaptureInput *oldInput in oldInputs)
		[self.session removeInput:oldInput];
	
	AVCaptureDeviceInput* input = [self pickCamera];
	if ( ! input ) {
		// failed, restore old inputs
		for (AVCaptureInput *oldInput in oldInputs)
			[self.session addInput:oldInput];
	} else {
		// succeeded, set input and update connection states
		[self.session addInput:input];
		[self updateAVFoundationDetection:nil];
		[self updateCoreImageDetection:nil];
	}
	[self.session commitConfiguration];
}

// this will freeze the preview when a still image is captured, we will unfreeze it when the graphics code is finished processing the image
- (void)observeValueForKeyPath:(NSString *)keyPath ofObject:(id)object change:(NSDictionary *)change context:(void *)context
{
	if ( context == AVCaptureStillImageIsCapturingStillImageContext ) {
		BOOL isCapturingStillImage = [[change objectForKey:NSKeyValueChangeNewKey] boolValue];
		
		if ( isCapturingStillImage ) {
			[self.previewView.superview addSubview:flashView];
			[UIView animateWithDuration:.4f
				animations:^{ flashView.alpha=0.65f; }
			 ];
			self.previewLayer.connection.enabled = NO;
		}
	}
}

// Graphics code will call this when still image capture processing is complete
- (void) unfreezePreview
{
	self.previewLayer.connection.enabled = YES;
	[UIView animateWithDuration:.4f
					 animations:^{ flashView.alpha=0; }
					 completion:^(BOOL finished){ [flashView removeFromSuperview]; }
	 ];
}


#pragma mark - Interface Builder actions

- (IBAction)switchCameras:(id)sender
{
	UserDefaults.usingFrontCamera = !UserDefaults.usingFrontCamera;
	[self updateCameraSelection];
}

- (IBAction)handlePinchGesture:(UIPinchGestureRecognizer *)recognizer
{
	BOOL allTouchesAreOnThePreviewLayer = YES;
	NSUInteger numTouches = [recognizer numberOfTouches], i;
	for ( i = 0; i < numTouches; ++i ) {
		CGPoint location = [recognizer locationOfTouch:i inView:self.previewView];
		CGPoint convertedLocation = [self.previewLayer convertPoint:location fromLayer:self.previewLayer.superlayer];
		if ( ! [self.previewLayer containsPoint:convertedLocation] ) {
			allTouchesAreOnThePreviewLayer = NO;
			break;
		}
	}
	
	if ( allTouchesAreOnThePreviewLayer ) {
		self.effectiveScale = beginGestureScale * recognizer.scale;
		if (self.effectiveScale < 1.0)
			self.effectiveScale = 1.0;
		[CATransaction begin];
		[CATransaction setAnimationDuration:.025];
		[self.previewLayer setAffineTransform:CGAffineTransformMakeScale(self.effectiveScale, self.effectiveScale)];
		[CATransaction commit];
	}
}

- (IBAction)updateUsingAnimations:(UISwitch *)sender {
	UserDefaults.usingAnimation = self.animationSwitch.on;
}

- (void)toggleRecording:(id)sender {
    if (self.videoRecordingStatus == VideoRecordingStatusIdle) {
        [self startRecording];
    } else {
        [self stopRecording];
    }
}

- (void)startRecording {
    @synchronized(self) {
        if (self.videoRecordingStatus != VideoRecordingStatusIdle) {
            // Already recording
            return;
        }
        NSLog(@"Starting recording");
        self.videoRecordingStatus = VideoRecordingStatusStartingRecording;
    }

    self.movieRecorder = [[MovieRecorder alloc] initWithURL:self.recordingURL];
    
    CGAffineTransform videoTransform = [self transformFromVideoBufferOrientationToOrientation:self.recordingOrientation withAutoMirroring:NO]; // Front camera recording shouldn't be mirrored
    [self.movieRecorder addVideoTrackWithSourceFormatDescription:self.outputVideoFormatDescription transform:videoTransform];
    
    dispatch_queue_t callbackQueue = dispatch_queue_create( "com.apple.sample.sessionmanager.recordercallback", DISPATCH_QUEUE_SERIAL ); // guarantee ordering of callbacks with a serial queue
    [self.movieRecorder setDelegate:self callbackQueue:callbackQueue];
    
    [self.movieRecorder prepareToRecord]; // asynchronous, will call us back with recorderDidFinishPreparing: or recorder:didFailWithError: when done
}

- (void)stopRecording {
    @synchronized(self) {
        if (self.videoRecordingStatus != VideoRecordingStatusRecording) {
            // Not recodring to stop
            return;
        }
        NSLog(@"Stopping recording");
        self.videoRecordingStatus = VideoRecordingStatusStoppingRecording;
    }
    
    [self.movieRecorder finishRecording];
}

#pragma mark - MovieRecorderDelegate

- (void)movieRecorder:(MovieRecorder *)recorder didFailWithError:(NSError *)error {
    NSLog(@"Recording did fail");
    @synchronized(self) {
        self.movieRecorder = nil;
        self.videoRecordingStatus = VideoRecordingStatusIdle;
    }
    
    dispatch_async(dispatch_get_main_queue(), ^{
        [self.recordBarButtonItem setTitle:@"Record"];
    });
}

- (void)movieRecorderDidFinishPreparing:(MovieRecorder *)recorder {
    NSLog(@"Recording did finish preparing");
    @synchronized(self) {
        self.videoRecordingStatus = VideoRecordingStatusRecording;
    }

    self.startTime = [NSDate new];
    
    dispatch_async(dispatch_get_main_queue(), ^{
        [self.recordBarButtonItem setTitle:@"Stop"];
    });
}

- (void)movieRecorderDidFinishRecording:(MovieRecorder *)recorder {
    // No state transition, we are still in the process of stopping.
    // We will be stopped once we save to the assets library.
    self.movieRecorder = nil;
    
    ALAssetsLibrary *library = [[ALAssetsLibrary alloc] init];
    [library writeVideoAtPathToSavedPhotosAlbum:self.recordingURL completionBlock:^(NSURL *assetURL, NSError *error) {
        
//        [[NSFileManager defaultManager] removeItemAtURL:self.recordingURL error:NULL];
        
        @synchronized( self ) {
            NSLog(@"Recording did finish recording");
            self.videoRecordingStatus = VideoRecordingStatusIdle;
        }
        dispatch_async(dispatch_get_main_queue(), ^{
            [self.recordBarButtonItem setTitle:@"Record"];
            [self askForNoteName];
        });
    }];
}

- (void)askForNoteName {
    UIAlertController *alert = [UIAlertController alertControllerWithTitle:@"Note name"
                                                                   message:@"Please enter your note name"
                                                                preferredStyle:UIAlertControllerStyleAlert];
    [alert addTextFieldWithConfigurationHandler:nil];
    UIAlertAction *confirmAction = [UIAlertAction actionWithTitle:@"OK" style:UIAlertActionStyleDefault handler:^(UIAlertAction *action) {
        NSString *noteName = ((UITextField *)[alert.textFields objectAtIndex:0]).text;
        [self sendCollectedData:noteName];
        [self cleanUpAfterRecording];
    }];
    UIAlertAction *cancelAction = [UIAlertAction actionWithTitle:@"Cancel" style:UIAlertActionStyleCancel handler:^(UIAlertAction *action) {
        [self cleanUpAfterRecording];
    }];
    [alert addAction:confirmAction];
    [alert addAction:cancelAction];
    [self presentViewController:alert animated:YES completion:nil];
}

- (void)sendCollectedData:(NSString *)noteName {
    NSMutableArray *framesForJSON = [[NSMutableArray alloc] init];
    for (Frame *frame in self.frames) {
        [framesForJSON addObject:[frame toDictionaryForJSON]];
    }
    NSError *error;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:framesForJSON options:NSJSONWritingPrettyPrinted error:&error];
    NSString *jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
    NSLog(@"JSON: %@", jsonString);

    [MBProgressHUD showHUDAddedTo:self.view animated:YES];
    AFHTTPSessionManager *manager = [[AFHTTPSessionManager alloc] initWithBaseURL:[NSURL URLWithString:@"http://172.27.13.221:8080/"]];
    NSDictionary *dict = @{@"title": noteName, @"content": jsonString};
    [manager POST:@"evernote" parameters:dict constructingBodyWithBlock:^(id<AFMultipartFormData> formData) {
        NSError *error;
        [formData appendPartWithFileURL:self.recordingURL name:@"noteVideo" error:&error];
    } success:^(NSURLSessionDataTask *task, id responseObject) {
        [MBProgressHUD hideHUDForView:self.view animated:NO];
        NSDictionary *dict = (NSDictionary *)responseObject;
        NSString *urlString = [dict objectForKey:@"url"];
        NSURL *url = [NSURL URLWithString:urlString];
        [[UIApplication sharedApplication] openURL: url];
    } failure:^(NSURLSessionDataTask *task, NSError *error) {
        [MBProgressHUD hideHUDForView:self.view animated:YES];
    }];
}

- (void)cleanUpAfterRecording {
    NSMutableString *dataDesc = [[NSMutableString alloc] init];
    for (Frame *frame in self.frames) {
        [dataDesc appendFormat:@"%@\n", frame.description];
    }
    NSString *filePath = [NSString pathWithComponents:@[NSTemporaryDirectory(), @"frames.txt"]];
    NSLog(@"Export to: %@", filePath);
    NSError *error;
    [dataDesc writeToFile:filePath atomically:YES encoding:NSUTF8StringEncoding error:&error];
    
    [self.frames removeAllObjects];
}

// Auto mirroring: Front camera is mirrored; back camera isn't
- (CGAffineTransform)transformFromVideoBufferOrientationToOrientation:(AVCaptureVideoOrientation)orientation withAutoMirroring:(BOOL)mirror
{
    CGAffineTransform transform = CGAffineTransformIdentity;
    
    // Calculate offsets from an arbitrary reference orientation (portrait)
    CGFloat orientationAngleOffset = angleOffsetFromPortraitOrientationToOrientation( orientation );
    CGFloat videoOrientationAngleOffset = angleOffsetFromPortraitOrientationToOrientation( self.videoOrientation );
    
    // Find the difference in angle between the desired orientation and the video orientation
    CGFloat angleOffset = orientationAngleOffset - videoOrientationAngleOffset;
    transform = CGAffineTransformMakeRotation(angleOffset);
    
    if ( _videoDevice.position == AVCaptureDevicePositionFront ) {
        if ( mirror ) {
            transform = CGAffineTransformScale(transform, -1, 1);
        }
        else {
            if ( UIInterfaceOrientationIsPortrait((UIInterfaceOrientation)orientation) ) {
                transform = CGAffineTransformRotate(transform, M_PI);
            }
        }
    }
    
    return transform;
}

#pragma mark - View lifecycle

- (void)dealloc
{
	[self teardownAVCapture];
	flashView = nil;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
	
	self.effectiveScale = 1.0;
	
	self.facePicker.layer.borderWidth=1;
	self.facePicker.layer.cornerRadius=10;
	
	self.fpsView.layer.borderWidth=1;
	self.fpsView.layer.cornerRadius=10;
	
	flashView = [[UIView alloc] initWithFrame:self.previewView.frame];
	flashView.backgroundColor = [UIColor whiteColor];
	flashView.alpha = 0;
	
	self.mustacheSwitch.on = UserDefaults.displayAVFMustaches;
	self.avfRectSwitch.on = UserDefaults.displayAVFRects;
	self.ciRectSwitch.on = UserDefaults.displayCIRects;
	self.animationSwitch.on = UserDefaults.usingAnimation;
    
    self.recordBarButtonItem.title = @"Record";

	[self setupAVCapture];
}

- (void)viewDidUnload
{
	[self teardownAVCapture];
	flashView = nil;
	self.previewView=nil;
	self.facePicker=nil;
	self.fpsView=nil;
	self.avfFPSLabel=nil;
	self.ciFPSLabel=nil;
	self.mustacheSwitch=nil;
	self.animationSwitch=nil;
	self.avfRectSwitch=nil;
	self.ciRectSwitch=nil;
    [super viewDidUnload];
}

- (void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];
}

- (void)viewDidAppear:(BOOL)animated
{
    [super viewDidAppear:animated];
}

- (void)viewWillDisappear:(BOOL)animated
{
	[super viewWillDisappear:animated];
}

- (void)viewDidDisappear:(BOOL)animated
{
	[super viewDidDisappear:animated];
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    // Return YES for supported orientations
	return (interfaceOrientation == UIInterfaceOrientationPortrait);
}

- (BOOL)gestureRecognizerShouldBegin:(UIGestureRecognizer *)gestureRecognizer
{
	if ( [gestureRecognizer isKindOfClass:[UIPinchGestureRecognizer class]] ) {
		beginGestureScale = self.effectiveScale;
	}
	return YES;
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Release any cached data, images, etc that aren't in use.
}

@end

void displayErrorOnMainQueue(NSError *error, NSString *message)
{
	dispatch_async(dispatch_get_main_queue(), ^(void) {
		UIAlertView* alert = [UIAlertView new];
		if(error) {
			alert.title = [NSString stringWithFormat:@"%@ (%zd)", message, error.code];
			alert.message = [error localizedDescription];
		} else {
			alert.title = message;
		}
		[alert addButtonWithTitle:@"Dismiss"];
		[alert show];
	});
}

