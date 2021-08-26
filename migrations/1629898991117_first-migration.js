exports.up = pgm => {
  pgm.createTable ('customers', {
    email: { type: 'varchar(30)', notNull: true, primaryKey: true },
    name: { type: 'varchar(30)', notNull: true },
  })

  pgm.createTable ('reservations', {
    id: 'id',
    customer: {
      type: 'varchar(30)',
      notNull: true,
      references: '"customers"',
      onDelete: 'cascade',
    },
    restaurantTable: {
      type: 'integer',
      notNull: true,
    },
    arrivalDate: {
      type: 'date',
      notNull: true
    },
    arrivalTime: {
      type: 'time',
      notNull: true,
    }
  })
}
