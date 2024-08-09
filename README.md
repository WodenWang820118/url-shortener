# KAFKA-Nest

Kafka Nest is a project showcasing data infrastructure to handle the high volume of events. It has multiple sub-projects under the PNPM mono repo.

## Prerequisites

- The implementations are on Windows machines but may be modified to run Kafka on other Operating Systems.
- Enable [virtualization](https://support.microsoft.com/en-us/windows/enable-virtualization-on-windows-11-pcs-c5578302-6e43-4b4b-a449-8ced115f58e1) if using Windows.
- [Install Linux with wsl](https://learn.microsoft.com/en-us/windows/wsl/install)
- Java 8+ installed. You may install it with the `wsl` on Windows.
- Please [download Zookeeper](https://zookeeper.apache.org/) and unzip it.
- Please [download Kafka](https://kafka.apache.org/downloads) and unzip it. Then follow the [quickstart guide](https://kafka.apache.org/quickstart) to verify Kafka broker could be opened via Zookeeper.
- It's using [PNPM](https://pnpm.io/workspaces) to manage the monorepo

## Kafka Manager

It's a project to manage Kafka broker, which depends on the local command line scripts. Please add a `.env` file to the root directory and specify the binary file path.

- KAFKA_PATH: where you unzip the Kafka binary
- KAFKA_SCRIPTS_PATH: a relative path where you start the batch file. e.g., `bin\windows\zookeeper-server-start.bat` on Windows machine
- KAFKA_LOGS_PATH: where you save the relevant logs; delete logs when bumping into starting failure
- ZOO_KEEPER_PATH: where you unzip the Zookeeper binary
- ZOO_KEEPER_SCRIPTS_PATH: a relative path that starts the zookeeper server. e.g., `bin\windows\zookeeper-server-start.bat`
- ZOO_KEEPER_LOGS_PATH: where you save the relevant logs; delete logs when bumping into starting failure

Then, run the command

```bash
pnpm run dev:kafka-manager
```

If facing the starting up issue, which says `Error:KeeperErrorCode = NodeExists`, please manually [delete the logs for Kafka and Zookeeper](https://stackoverflow.com/questions/34393837/zookeeper-kafka-error-keepererrorcode-nodeexists).

## Kafka Admin

It's a project where to handle [topics and partitions](https://stackoverflow.com/questions/38024514/understanding-kafka-topics-and-partitions). After starting the Kafka manager, we can then start the admin with a listening port to interact with the Kafka broker server. Please run:

```bash
pnpm run dev:kafka-admin
```

## Producer

It's a hybrid project that acts as a backend and a Kafka producer at the same time. It should be run after activating the Kafka manager. Please run:

```bash
pnpm run dev:producer
```

## Consumer

The consumer project will subscribe and pull messages from topics, specifically, from the partitions within a topic. It should be run after starting the Kafka manager. Please run:

```bash
pnpm run dev:consumer
```
