//
//  Face.h
//  StacheCam
//
//  Created by Huy Nguyen on 10/11/14.
//
//

@interface Face : NSObject

@property (nonatomic) CGRect bounds;
@property (nonatomic) CGPoint leftEyePosition;
@property (nonatomic) CGPoint rightEyePosition;

- (instancetype)initWithBounds:(CGRect)bounds leftEyePosition:(CGPoint)leftEyePosition rightEyePosition:(CGPoint)rightEyePosition;

@end