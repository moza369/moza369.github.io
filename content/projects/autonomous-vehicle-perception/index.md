---
title: "Autonomous Vehicle Perception System"
description: "A final integrated university prototype combining nine computer-vision scenarios for driver safety, passenger safety, traffic understanding, and road-environment perception."
date: 2026-10-21
categories: [Projects]
tags: [computer-vision, machine-learning, python, autonomous-vehicles, mediapipe]
author: MOZA
tech: ["Python", "OpenCV", "NumPy", "MediaPipe", "PyTorch", "Ultralytics", "ONNX Runtime", "Tkinter"]
github: "https://github.com/moza369/Autonomous-Vehicle-Perception"
status: "Completed"
cover: "/projects/autonomous-vehicle-perception/images/dashboard.png"
toc: true
---

## Overview

[Autonomous Vehicle Perception](https://github.com/moza369/Autonomous-Vehicle-Perception) is a group project developed for the **Master MIATE Computer Vision** course. It combines nine perception scenarios in one Tkinter application that can process video files, images, or a live camera depending on the selected scenario.

The repository describes the result as a **final integrated university prototype**. I served as the team leader and repository maintainer, coordinating the shared repository structure and integration while the scenarios were developed collaboratively by the team. This article focuses on the final `main` branch and does not claim that I personally implemented every detector.

## Objectives

The project had three main objectives:

- Explore computer-vision techniques for driver, passenger, traffic, and road-environment perception.
- Preserve the independent scenario implementations while integrating them into one application.
- Provide a common workflow for selecting an input, running a detector, displaying an annotated frame, and inspecting telemetry.

The output is a perception and decision-making prototype. Its braking, steering, speed, airbag, and pull-over messages are software-level or simulated decisions; the application does not control real vehicle hardware.

## Integrated Architecture

The final application separates shared infrastructure from scenario-specific detectors:

```text
                         Tkinter Dashboard
                         /       |       \
                Select scenario  |   Display telemetry
                                 |
                          VideoManager
                   video / image / live camera
                                 |
                         ScenarioManager
                         detector lifecycle
                                 |
                         Scenario Detector
                    perception + scenario logic
                                 |
                    annotated frame + telemetry
                                 |
                         Dashboard display
```

Every integrated detector follows the same processing idea:

```python
annotated_frame, telemetry = detector.process_frame(frame)
```

`VideoManager` owns source handling, frame reading, FPS and progress information, while `ScenarioManager` lazily creates, resets, and releases the selected detector. The dashboard then displays the annotated frame and the detector-specific telemetry.

The repository centralizes configuration in `config/settings.py`, including model paths, scenario metadata, input modes, demo filenames, and shared asset directories. The final branch contains the common entry point in `main.py`, the GUI in `gui/dashboard.py`, shared managers in `core/`, and detector modules under `scenarios/`.

<figure>
  <img src="/projects/autonomous-vehicle-perception/images/dashboard.png" alt="Tkinter dashboard for the Autonomous Vehicle Perception System">
  <figcaption>The integrated Tkinter dashboard used to select scenarios and run the perception pipeline.</figcaption>
</figure>

<figure>
  <img src="/projects/autonomous-vehicle-perception/images/demo-thumbnail.png" alt="Thumbnail for the Autonomous Vehicle Perception System demonstration video">
  <figcaption>Repository demonstration thumbnail for the integrated scenarios.</figcaption>
</figure>

## Implemented Scenarios

The final application integrates nine scenarios:

| Scenario | Main approach | Input |
|---|---|---|
| Driver distraction monitoring | MediaPipe FaceMesh, head-down score, and eye aspect ratio | Video or camera |
| Passenger safety and posture | MediaPipe Pose, posture heuristics, and a safety state machine | Video or camera |
| Traffic sign and signal recognition | Custom YOLO-based detector and braking-distance logic | Video |
| Drivable area and free space | Lane geometry and free-space estimation in the final integrated detector | Image or video |
| Road surface conditions | Classical computer-vision heuristics | Image, video, or camera |
| Construction-zone detection | HSV segmentation and cone detection | Image, video, or camera |
| Vulnerable road-user detection | YOLOv8 and ego-corridor reasoning | Video |
| Vehicle-intent detection | YOLO vehicle detection, light-color analysis, and blink tracking | Video |
| Emergency-vehicle detection | Visual red/blue flashing-light analysis | Video or camera |

The repository also documents important integration differences. For example, the final drivable-area detector uses lane geometry rather than treating the registered generic ONNX segmentation output as the active drivable-area mask. The final traffic-sign detector does not include the original EasyOCR numeric speed-limit pipeline, and the final emergency-vehicle detector focuses on visual flashing-light analysis rather than microphone-based siren confirmation.

## Driver Distraction Monitoring

The driver-distraction scenario uses **MediaPipe FaceMesh**, not a separate object-detection model. It tracks one face and derives two indicators from facial landmarks:

- A head-down score based on the relative positions of the forehead, nose, chin, and eye landmarks.
- The **Eye Aspect Ratio (EAR)** for both eyes, calculated from selected horizontal and vertical landmark distances.

The detector marks the driver as potentially distracted when the head-down score exceeds its threshold or the average EAR falls below its threshold. It also records the distraction duration. If the warning persists for three seconds, the prototype enters a simulated limp-mode state, displays a cruise-control disengagement message, and gradually reduces its software-level speed value down to the configured minimum.

When the driver becomes attentive again, the warning timer, limp-mode state, and simulated speed are reset. The returned telemetry includes the status, head-down score, EAR, speed, limp-mode flag, distraction duration, and action text.

This approach is a practical landmark-based heuristic: it does not claim to understand every form of distraction, and its behavior depends on face visibility, camera position, lighting, and the chosen thresholds.

## Passenger Safety and Posture

The passenger-safety scenario uses **MediaPipe Pose** with a lightweight posture model and a separate state machine. It extracts pose landmarks for the nose, shoulders, hips, and ankles, then applies geometric rules:

- Forward leaning is estimated when the nose is sufficiently below the shoulder center.
- Sideways leaning is estimated from the horizontal distance between the nose and shoulder center.
- Feet-on-dashboard is estimated when a visible ankle is above the hip center.

These conditions are combined into an `out_of_position` result. The scenario also includes a seatbelt status that can be toggled in the GUI. The `SafetySystem` combines the seatbelt state and posture result into `NORMAL`, `WARNING`, or `DANGER`:

| Condition | Prototype state | Software-level response |
|---|---|---|
| Seatbelt on and acceptable posture | Normal | Normal passenger-safety operation |
| Seatbelt off or posture problem | Warning | Warning message and telemetry |
| Seatbelt off and passenger out of position | Danger | Simulated airbag-disabled and speed-restricted action |

The detector returns posture, seatbelt status, system state, airbag status, speed limit, warning text, and action text. It can also trigger a non-blocking warning sound when the state is not normal.

The seatbelt control is explicitly a demonstration control rather than an automatically verified seatbelt detector. Likewise, airbag and speed-limit outputs are simulated software states and do not control a real vehicle.

## Other Computer-Vision Exercises

The remaining scenarios broaden the project beyond driver and passenger safety:

- Traffic signs and signals are detected with a custom YOLO model and connected to decision logic such as stopping or adjusting speed.
- Drivable-area/free-space processing uses lane extraction, edge detection, Hough-style geometry, lane fitting, and lane-center reasoning in the final integrated implementation.
- Road-surface analysis uses classical heuristics for dry, wet, snow, ice, and pothole-related conditions.
- Construction-zone detection uses HSV color segmentation to locate orange cones.
- Vulnerable road-user detection uses YOLOv8 together with an ego-vehicle corridor.
- Vehicle-intent detection combines vehicle tracking with tail-light, brake-light, turn-signal, and hazard-light analysis.
- Emergency-vehicle detection analyzes visual red and blue flashing-light behavior.

These scenarios produce annotated frames and scenario-specific telemetry rather than production vehicle controls.

## Installation and Execution

The repository provides a Python-based setup using a virtual environment.

### Requirements

- Python 3.10 or later
- OpenCV
- NumPy
- Pillow
- PyTorch and torchvision
- Ultralytics
- ONNX Runtime
- MediaPipe
- Tkinter
- Sounddevice, optionally used for siren/audio-related functionality

### Setup

Clone the repository:

```bash
git clone git@github.com:moza369/Autonomous-Vehicle-Perception.git
cd Autonomous-Vehicle-Perception
```

Create and activate a virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

On Windows:

```powershell
python -m venv .venv
.venv\Scripts\activate
```

Install the dependencies:

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

On Debian or Ubuntu, install Tkinter separately if it is missing:

```bash
sudo apt install python3-tk
```

### Run the application

From the repository root, start the integrated dashboard:

```bash
python main.py
```

The basic workflow is:

1. Launch the application.
2. Select a scenario.
3. Select or use the configured input source.
4. Start the scenario.
5. Observe the annotated frame and telemetry.
6. Stop the scenario when finished.

Depending on the scenario, the application supports video files, images, or a live camera. The repository includes model files and configured demo media paths for the final integrated branch.

## Group Workflow and Repository Organization

The `develop` branch preserves the original team scenario implementations and development history. Those implementations were developed independently and could have their own entry points, model paths, display loops, and results directories.

The `main` branch is the final integrated application. It introduces a shared dashboard, centralized input handling, detector lifecycle management, configuration, and a common detector contract. The repository documents a workflow in which contributors work on feature branches, open pull requests toward `develop`, and avoid direct pushes to `main` or `develop`.

As team leader and repository maintainer, my responsibilities included maintaining the shared repository, coordinating the integration direction, and preserving the distinction between the original team work on `develop` and the final integrated application on `main`.

## Challenges and Limitations

- Detection behavior depends on camera quality, lighting, visibility, input video, model behavior, and scenario-specific thresholds or heuristics.
- The driver-distraction and passenger-posture scenarios depend on visible and trackable facial or body landmarks.
- The passenger seatbelt control is a demonstration toggle, not an automatic seatbelt-perception model.
- Several outputs describe simulated actions such as braking, steering, speed reduction, airbag state, or pulling over.
- The application does not directly control a real vehicle ECU, braking system, steering system, airbag system, or other vehicle hardware.
- No accuracy, latency, or safety benchmark is claimed by the repository.

## Future Improvements

The following are reasonable future directions for the prototype, not claims about current implementation:

- Add repeatable evaluation datasets and scenario-specific metrics.
- Improve calibration and robustness across lighting, viewpoints, and camera placements.
- Replace demonstration controls and simulated actions with validated interfaces in a controlled research environment.
- Add automated tests for detector state transitions and shared input/lifecycle components.
- Continue documenting differences between the original scenario implementations and the final integrated detectors.

## Source Code

The complete source code, models, assets, documentation, and contribution history are available here:

[View Autonomous Vehicle Perception on GitHub](https://github.com/moza369/Autonomous-Vehicle-Perception)
