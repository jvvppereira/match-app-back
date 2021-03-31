export default (sequelize, DataTypes) => {
  return sequelize.define(
    "experience",
    {
      id: { primaryKey: true, type: DataTypes.INTEGER, autoIncrement: true },
      name: DataTypes.STRING,
      startsAt: DataTypes.INTEGER,
      endsAt: DataTypes.INTEGER,
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );
};
