
<h1 align="center">SoPra FS24 - KAEPS</h1>
<h2 align="center"> :pencil: Introduction</h2>
"'KAEPS' is a web-based multiplayer game that engages players with a unique auditory challenge. Players take turns retrieving random words or phrases from an API, recording them, and then having the system invert the audio. Guessers must attempt their mimicry and decipher the original word from the second-reversed playback, with the system checking their submitted answer. To realize this game, two core concepts are using a word-distributed API to give a random word and utilizing the Web Audio API to enhance the web apps' capability to process real-time audio efficiently. 'KAEPS' is ideal for web deployment due to its straightforward interface, ease of access without complex installations, and the flexibility to support cross-platform access, showcasing the suitability of web technologies for interactive and engaging online games
<h3 align="center">:round_pushpin: Goal</h3>
The goal of this project is to create an engaging and interactive game that allows players to speak and guess others' reverse audio, while earning points and competing against each other. The project aims to provide a fun and challenging experience that encourages creativity, imagination and quick thinking. The application should be an entertaining and intuitive game that can be easily played and enjoyed by people of all ages and backgrounds.

<h3 align="center">:round_pushpin: Motivation</h3>
The motivation behind a KAEPS is to provide a fun, interactive, and lighthearted activity that can be played with friends, family, or even strangers. The game can be a great way to unwind after a long day, or to simply share a laugh with others. We hope our game can provide a fun and enjoyable experience for all those involved.

## :book: Table of content

- [Technologies](#technologies)
- [High-level components](#high-level-components)
- [Launch & Deployment](#launch-deployment)
- [Roadmap](#roadmap)
- [Contributions](#contributions)
- [License](#license)

## Technologies

- SpringBoot
- Gradle
- Java
- JPA
- Mockito
- RESTful API
- WebSockets
- Google Cloud
- SonarQube

## High level components

### [GameConTroller](https://github.com/sopra-fs24-group-09/sopra-fs24-group-09-server/blob/main/src/main/java/ch/uzh/ifi/hase/soprafs24/controller/GameController.java)

The game controller is critical to the app's functionality because it handles practically all API requests performed during the game turns. For example, it is responsible for setting player ready/unready, start the game and upload audio and guessing words.

### [GameController](https://github.com/sopra-fs24-group-09/sopra-fs24-group-09-server/blob/main/src/main/java/ch/uzh/ifi/hase/soprafs24/controller/GameController.java) && [RoomController](https://github.com/sopra-fs24-group-09/sopra-fs24-group-09-server/blob/main/src/main/java/ch/uzh/ifi/hase/soprafs24/controller/RoomController.java)

The user can view a public lobby, find existing waiting rooms and select one to join to a room, or user can exit the room when he/she is already in the room, then the owner of this room can start the game. And game controller controls the startings and endings of the games. After finishing each game, the game and room entity will be deleted.

### [Game](https://github.com/sopra-fs24-group-09/sopra-fs24-group-09-server/blob/main/src/main/java/ch/uzh/ifi/hase/soprafs24/entity/Game.java)

The game entity extends the room, will be created when the game starts, and it will be deleted after the game ends. The game entity contains the game's status, the current player's turn, the current round, and all needed information.

### [Player](https://github.com/sopra-fs24-group-09/sopra-fs24-group-09-server/blob/main/src/main/java/ch/uzh/ifi/hase/soprafs24/entity/Player.java)

The player entity extends the user, will be created when the game starts, and it will be deleted after the game ends. The player entity contains the player's status, the player's score, and all needed information.

<a name="launch-deployment"/>

## Launch & Deployment

### Setup this Template with your IDE of choice
Download your IDE of choice (e.g., [IntelliJ](https://www.jetbrains.com/idea/download/), [Visual Studio Code](https://code.visualstudio.com/), or [Eclipse](http://www.eclipse.org/downloads/)). Make sure Java 17 is installed on your system (for Windows, please make sure your `JAVA_HOME` environment variable is set to the correct version of Java).

### IntelliJ
1. File -> Open... -> SoPra server template
2. Accept to import the project as a `gradle project`
3. To build right click the `build.gradle` file and choose `Run Build`

### VS Code
The following extensions can help you get started more easily:
-   `vmware.vscode-spring-boot`
-   `vscjava.vscode-spring-initializr`
-   `vscjava.vscode-spring-boot-dashboard`
-   `vscjava.vscode-java-pack`

**Note:** You'll need to build the project first with Gradle, just click on the `build` command in the _Gradle Tasks_ extension. Then check the _Spring Boot Dashboard_ extension if it already shows `soprafs24` and hit the play button to start the server. If it doesn't show up, restart VS Code and check again.

### Building with Gradle
You can use the local Gradle Wrapper to build the application.
-   macOS: `./gradlew`
-   Linux: `./gradlew`
-   Windows: `./gradlew.bat`

More Information about [Gradle Wrapper](https://docs.gradle.org/current/userguide/gradle_wrapper.html) and [Gradle](https://gradle.org/docs/).

### Build

```bash
./gradlew build
```

### Run

```bash
./gradlew bootRun
```

You can verify that the server is running by visiting `localhost:8080` in your browser.

### Test

```bash
./gradlew test
```
### Development Mode
You can start the backend in development mode, this will automatically trigger a new build and reload the application
once the content of a file has been changed.

Start two terminal windows and run:

`./gradlew build --continuous`

and in the other one:

`./gradlew bootRun`

If you want to avoid running all tests with every change, use the following command instead:

`./gradlew build --continuous -xtest`

## Roadmap

- :negative_squared_cross_mark: Implement a live chat feature.
- :negative_squared_cross_mark: Allow to finish each round earlier
- :negative_squared_cross_mark: Configurable setting of game rounds and word difficulty.
- :negative_squared_cross_mark: Optional re-match after a game ends.


## Authors

| Name          | Personal page                                                                                                                                  |
|---------------| ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Han Yang      | [![GitHub Badge](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Haaaan1)   |
| Shaochang Tan | [![GitHub Badge](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/petertheprocess) |
| Yixuan Zhou   | [![GitHub Badge](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/yixuan-zhou-uzh)      |
| Zehao Zhang   | [![GitHub Badge](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Zehao-Zhang)     |
| Zihan Liu     | [![GitHub Badge](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/zihanltesla)    |


### Acknowledgement

- The client code is based on the [SoPra FS24 - Server Template](https://github.com/HASEL-UZH/sopra-fs24-template-server).
- Many thanks to **[Miro Vannini](https://github.com/mirovv)** who helped us as a Tutor and Scrum Master during this SoPra project.


## License
We publish the code under the terms of the [MIT License](https://github.com/sopra-fs24-group-09/sopra-fs24-group-09-server/blob/main/LICENSE) that allows distribution, modification, and commercial use. This software, however, comes without any warranty or liability.
