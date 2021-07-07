import Candidate from "./candidate";
import Technology from "./technology";

export default (sequelize, DataTypes) => {
  const candidate_technology = sequelize.define(
    "candidate_technology",
    {
      id: { primaryKey: true, type: DataTypes.INTEGER, autoIncrement: true },
      mainTechnology: DataTypes.TINYINT,
      candidateId: {
        references: {
          model: Candidate,
          key: "id",
        },
        type: DataTypes.INTEGER,
      },
      technologyId: {
        references: {
          model: Technology,
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

  candidate_technology.belongsTo(sequelize.import("./technology"), {
    foreignKey: "technologyId",
    targetKey: "id",
    as: "technology",
  });

  return candidate_technology;
};
