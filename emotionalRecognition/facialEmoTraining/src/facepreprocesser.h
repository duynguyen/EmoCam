#ifndef FACEPREPROCESSER_H
#define FACEPREPROCESSER_H

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

class facePreProcessor
{
public:
    facePreProcessor();
    bool loadModel(const std::string& faceModel, const std::string& eyeModel, const cv::Size defaultSize);

    bool run(const cv::Mat& curImg, cv::Mat& processedFace);
private:

    bool detectFaceAndEye(const cv::Mat& curImg, cv::Mat& faceRegion, std::vector<cv::Rect>& eyeRegions);

    void enhanceImgQuality(cv::Mat& faceImg, std::vector<cv::Rect>& eyeRegions);

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
