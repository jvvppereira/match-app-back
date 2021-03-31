import Candidate from "./candidate";
import Technology from "./technology";

export default (sequelize, DataTypes) => {
  return sequelize.define(
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
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );
};
