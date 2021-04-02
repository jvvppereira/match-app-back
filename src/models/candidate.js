import Experience from "./experience";

export default (sequelize, DataTypes) => {
  const candidate = sequelize.define(
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
      active: DataTypes.TINYINT,
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );

  candidate.belongsTo(sequelize.import("./experience"), {
    foreignKey: "experienceId",
    targetKey: "id",
  });

  return candidate;
};
