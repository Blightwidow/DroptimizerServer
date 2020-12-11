# Droptimizer Server

Aggregates the results of raidbots.com SimulationCraft reports for an entire raid team enabling leadership to make better decisions about how to distribute loot.

View the client [here](https://github.com/tim-ings/DroptimizerClient)

## Docker image

Docker image are built automatically and availables as package.

In order to avoid loosing data on restart, you should mount a volum targeting `/app/data.db` in order to save you database outside of the container.
