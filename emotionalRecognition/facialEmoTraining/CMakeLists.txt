cmake_minimum_required (VERSION 2.6) 

PROJECT(facialEmoTrainer)

# Requires OpenCV v2.4.1 or later
FIND_PACKAGE( OpenCV REQUIRED )
IF (${OpenCV_VERSION} VERSION_LESS 2.4.1)
    MESSAGE(FATAL_ERROR "OpenCV version is not compatible : ${OpenCV_VERSION}. FaceRec requires atleast OpenCV v2.4.1")
ENDIF()

# Add list of file to here
SET(SRC
    ./src/main.cpp 
    ./src/facepreprocesser.cpp
    ./src/facetrainer.cpp
)

## Qt
if( USE_QT5 )
message( STATUS "Using Qt5" )
endif()
if( NOT USE_QT5 )
find_package( Qt4 REQUIRED )
set( QT_USE_QTNETWORK TRUE )
set( QT_USE_GUI FALSE )
include( ${QT_USE_FILE} )
add_definitions( ${QT_DEFINITIONS} )
add_definitions( -DUNICODE )
else()
# Qt5
find_package( Qt5Core REQUIRED )
set( CMAKE_AUTOMOC ON )
add_definitions( -DUSE_QT5 )
endif()

# BOOST
set(Boost_LIBRARY_DIR /usr/local/src/boost_1_46_1/stage/lib)
find_package(Boost COMPONENTS system filesystem REQUIRED)
include_directories(${Boost_INCLUDE_DIR})
link_directories(${Boost_LIBRARY_DIR})

ADD_EXECUTABLE( ${PROJECT_NAME} ${SRC} )
TARGET_LINK_LIBRARIES( ${PROJECT_NAME}  ${OpenCV_LIBS} ${Boost_LIBRARIES})
