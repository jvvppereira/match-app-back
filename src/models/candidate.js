import Experience from "./experience";

export default (sequelize, DataTypes) => {
  return sequelize.define(
    "candidate",
    {
      id: { primaryKey: true, type: DataTypes.INTEGER, autoIncrement: true },
      visualId: DataTypes.STRING,
      cityName: DataTypes.STRING,
      experienceId: {
        references: {
          model: Experience,
          key: "id",
        },
        type: DataTypes.INTEGER,
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );
};
