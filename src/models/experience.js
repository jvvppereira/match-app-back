export default (sequelize, DataTypes) => {
  return sequelize.define(
    "experience",
    {
      id: { primaryKey: true, type: DataTypes.INTEGER, autoIncrement: true },
      name: DataTypes.STRING,
      startsAt: DataTypes.INTEGER,
      endsAt: DataTypes.INTEGER,
      active: DataTypes.TINYINT,
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );
};
