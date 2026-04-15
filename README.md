# Data Narrator

## City Science Lab

<p align="center">
<img src="https://user-images.githubusercontent.com/36763878/219619895-12db4431-32d9-458b-a73f-548052404258.png" alt="Data Narrator logo" />
</p>

The Data Narrator Platform is a story-driven geospatial application for creating, editing and playing narrative map
experiences. It combines 2D and 3D map views with text, images, GeoJSON, WMS layers, 3D layers and interactive map
states so complex urban data can be communicated step by step.

This repository specifically contains the **Data Narrator add-on frontend**. Its role in the platform is to provide
the user-facing authoring and playback experience inside Masterportal: the story dashboard, story editor, step editor,
playback mode, layer selection, GeoJSON handling, 3D model integration and the surrounding UI logic.

## What the platform does

The platform allows users to:

1. create stories with chapters and ordered steps
2. define map state per step, including center, zoom and active layers
3. combine narrative content with 2D and 3D geodata
4. attach rich text, images and GeoJSON content to story steps
5. use WMS, standard information layers and 3D layers in a guided narrative flow
6. share stories through direct URLs to stories and individual steps
7. play stories as a guided spatial experience in the browser

## Repository roles

| Repository                                                                                 | Role                                                                            |
|--------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------|
| [`cut-dana-platform-addon`](https://github.com/citysciencelab/cut-dana-platform-addon)     | Frontend add-on for the Data Narrator UI and story workflow inside Masterportal |
| [`cut-dana-platform-mp`](https://github.com/citysciencelab/cut-dana-platform-mp)           | Masterportal-based map client that hosts and integrates the add-on              |
| [`cut-dana-platform-backend`](https://github.com/citysciencelab/cut-dana-platform-backend) | Backend service for story persistence, files, API access and application data   |
| [`cut-dana-platform-docker`](https://github.com/citysciencelab/cut-dana-platform-docker)   | Docker-based local and deployment setup for running the full platform stack     |

## How the repositories work together

1. `cut-dana-platform-docker` starts the local or deployed platform stack.
2. `cut-dana-platform-backend` serves stories, uploads and API endpoints.
3. `cut-dana-platform-mp` provides the map application shell.
4. `cut-dana-platform-addon` adds the Data Narrator authoring and playback experience inside that shell.

## Role of this repository

`cut-dana-platform-addon` is the frontend feature repository for the Data Narrator. It does not provide the map shell,
deployment setup or persistence layer on its own. Instead, it extends the Masterportal client with the narrative
workflow and depends on the backend and docker/deployment repositories for a complete platform setup.

## Main capabilities of this repository

- story dashboard with story selection and entry points
- story creation and editing with chapter and step management
- step-based map state authoring for 2D and 3D
- integration of information layers, WMS layers and 3D layers
- GeoJSON upload, editing and playback support
- rich text editing for narrative content
- direct deep links to stories and individual steps
- browser-based playback for guided storytelling
