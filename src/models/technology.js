export default (sequelize, DataTypes) => {
  return sequelize.define(
    "technology",
    {
      id: { primaryKey: true, type: DataTypes.INTEGER, autoIncrement: true },
      name: DataTypes.STRING,
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );
};
