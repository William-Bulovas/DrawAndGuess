# Draw Guess Game

Try it! https://draw-guess.william-bulovas.com

Start a game and get some friends to join!

## Contents

This package contains the following:

* CDK to deploy the resources
  * Dynamo Table to store game Data
  * S3 bucket for static website
  * Lambda for compute
  * API Gateway for Websocket integration
* SvelteKit Web Application
  * This site uses a Svelte front end
* Lambda backend code for both guessing and websocket logic
