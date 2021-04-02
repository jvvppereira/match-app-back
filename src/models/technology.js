export default (sequelize, DataTypes) => {
  return sequelize.define(
    "technology",
    {
      id: { primaryKey: true, type: DataTypes.INTEGER, autoIncrement: true },
      name: DataTypes.STRING,
      active: DataTypes.TINYINT,
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );
};
