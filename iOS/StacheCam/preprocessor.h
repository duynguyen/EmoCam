#ifndef PREPROCESSER_H
#define PREPROCESSER_H

/* Pre-process the face image before using it for training
  1. Detect face + two eyes
  2. Cropping + Geometrical transformation
  3. Histogram equalization for each half of the face
  4. Bilateral filter to remove noise
  5. Apply elliptical mask on the face image to remove redundant region
  */

#include "opencv2/objdetect/objdetect.hpp"
#include "opencv2/opencv.hpp"

#include <string>
#include <iostream>
#include <vector>

class preProcessor
{
public:
    preProcessor();

    void run(cv::Mat& faceROI, const cv::Point2f& leftEye, const cv::Point2f& rightEye, const cv::Size& defaultFaceSize);
private: 

    void enhanceImgQuality(cv::Mat& faceImg, const cv::Point2f& leftEye, const cv::Point2f& rightEye, const cv::Size& defaultFaceSize);

    //histogram equalization on two sides of the face separately
    void equalizeLeftAndRightHalves(cv::Mat& faceImg);

    //cascade classifier for face and eyes
    cv::CascadeClassifier faceCascade;
    cv::CascadeClassifier eyeCascade;

    cv::Mat faceROI;
    std::vector<cv::Rect> eyes;
    cv::Size faceSize;

};

#endif // FACEPREPROCESSER_H
