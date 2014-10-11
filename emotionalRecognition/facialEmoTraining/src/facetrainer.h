#ifndef FACETRAINER_H
#define FACETRAINER_H

/* Warper for face recognizer class in OpenCV
 *
 */

#include "opencv2/opencv.hpp"
#include <string>
#include <iostream>

class faceTrainer
{
public:
    faceTrainer(const std::string facerecAlgorithm);

    void trainModel(std::vector<cv::Mat>& sample, std::vector<int> label);

    void showTrainingDebugData(const int faceWidth, const int faceHeight);

    void saveModel(const std::string modelName);

private:

    cv::Mat getImageFrom1DFloatMat(const cv::Mat matrixRow, int height);
    void printMatInfo(const cv::Mat M, const char *label);
    void printMat(const cv::Mat M, const char *label, int maxElements = 0);
    int getBitDepth(const cv::Mat M);

    cv::Ptr<cv::FaceRecognizer> model;

};

#endif // FACETRAINER_H
