//
//  Frame.m
//  StacheCam
//
//  Created by Huy Nguyen on 10/11/14.
//
//

#import "Frame.h"

@implementation Frame

@synthesize timestamp = _timestamp;
@synthesize faces = _faces;
@synthesize emotion = _emotion;

- (instancetype)initWithTimestamp:(long)timestamp faces:(NSArray *)faces emotion:(int)emotion {
    self = [super init];
    if (self) {
        _timestamp = timestamp;
        _faces = faces;
        _emotion = emotion;
    }
    return self;
}

- (NSString *)description {
    return [NSString stringWithFormat:@"%@", [[self.faces objectAtIndex:0] description]];
}

- (NSDictionary *)toDictionaryForJSON {
    NSString *emotionString = @"Neutral";
    switch (self.emotion) {
        case 1:
            emotionString = @"Happy";
            break;
        case 2:
            emotionString = @"Sad";
            break;
        case 3:
            emotionString = @"Angry";
            break;
        default:
            emotionString = @"Neutral";
            break;
    }
    
    return @{@"timestamp": [[NSNumber alloc] initWithLong:self.timestamp], @"emotion": emotionString};
}

@end
