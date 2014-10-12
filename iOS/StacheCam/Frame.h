//
//  Frame.h
//  StacheCam
//
//  Created by Huy Nguyen on 10/11/14.
//
//

@interface Frame : NSObject

@property (nonatomic) long timestamp; // in miliseconds
@property (strong, nonatomic) NSArray* faces;
@property (nonatomic) int emotion;

- (instancetype)initWithTimestamp:(long)timestamp faces:(NSArray *)faces emotion:(int)emotion;
- (NSDictionary *)toDictionaryForJSON;

@end