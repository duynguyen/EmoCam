#ifndef EMORECOGNIZER_H
#define EMORECOGNIZER_H

/* Emotion recognition class
 *
 */

#include "opencv2/opencv.hpp"
#include "string"
#include <vector>

#include "preprocessor.h"
enum emotionalState {UNDEFINED = -1, NEUTRAL = 0, HAPPY= 1, SAD = 2, ANGRY = 3, SURPRISING= 4};

struct emoFace {
    //constructor
    emoFace(){ emotion = UNDEFINED;}

    cv::Rect boundingBox;
    cv::Point2f leftEye;
    cv::Point2f rightEye;

    //emotional status of the face
    int emotion;
    std::vector<double> emoProb;
};


class emoRecognizer
{
public:
    //constructor: Load model
    emoRecognizer();

    /* Main rountine to recognize the emotional expression within the frame *
     * curFrame: current processing frame
     * facePos:location of each face appearing in current frame
     * timeStamp: time informatio of current frame
     */
    void process(const cv::Mat curFrame, std::vector<emoFace>& facePos, long timeStamp);

private:

    //model for recognition
    cv::Ptr<cv::FaceRecognizer> emoModel;
    std::string pathToModel;
    std::string emoRecMethod;
    //vector buffer to contain all face regions
    std::vector<cv::Mat> faceROI;

    //image pre-processor class
    preProcessor imgProcessor;

    //default size for face detection
    cv::Size defaultFaceSize;

};

#endif
