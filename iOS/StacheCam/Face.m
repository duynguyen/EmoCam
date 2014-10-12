//
//  Face.m
//  StacheCam
//
//  Created by Huy Nguyen on 10/11/14.
//
//

#import "Face.h"

@implementation Face

@synthesize bounds = _bounds;
@synthesize leftEyePosition = _leftEyePosition;
@synthesize rightEyePosition = _rightEyePosition;

- (instancetype)initWithBounds:(CGRect)bounds leftEyePosition:(CGPoint)leftEyePosition rightEyePosition:(CGPoint)rightEyePosition{
    self = [super init];
    if (self) {
        _bounds = bounds;
        _leftEyePosition = leftEyePosition;
        _rightEyePosition = rightEyePosition;
    }
    return self;
}

- (NSString *)description {
    return [NSString stringWithFormat:@"%f %f %f %f %f %f %f %f",
            self.bounds.origin.x, self.bounds.origin.y, self.bounds.size.width, self.bounds.size.height,
            self.leftEyePosition.x, self.leftEyePosition.y, self.rightEyePosition.x, self.rightEyePosition.y];
}

@end
