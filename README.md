
# WebRTC test app

Svelte app to test WebRTC based on PeerJS.

## Code overview

The WebRTC related code can be found in [PeerJsWebRtcClient.ts](src/ts/clients/webrtc/PeerJsWebRtcClient.ts).

The main UI code in [src/components/webrtc/WebRtcScreen.svelte](src/components/webrtc/WebRtcScreen.svelte).

## Run

Install [bun](https://bun.com/docs/installation) and run:

```shell
bun run dev
```

To build the Docker image run:

```shell
bun run build &&

docker build -f ./Dockerfile -t <your Docker registry and app name> .
```

## License

```text
Copyright 2025 dankito

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```