class MainRepository {
  constructor(dao) {
    this.dao = dao
  }

  // createTable - not sure how to make date reinforce for certain months
  // have not created calorie counter either
  createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS main (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        month INT NOT NULL CHECK (month >= 1 AND month <= 12),
        day INT NOT NULL CHECK (day >= 1 AND day <= 31),
        protein INT NOT NULL CHECK (protein >= 0 AND protein <= 100),
        vegetable INT NOT NULL CHECK (vegetable >= 0 AND vegetable <= 100),
        grain INT NOT NULL CHECK (grain >= 0 AND grain <= 100))`
    return this.dao.run(sql)
  }

  create(month, day, protein, vegetable, grain) {
    return this.dao.run(
      `INSERT INTO main (month, day, protein, vegetable, grain)
        VALUES (?, ?, ?, ?, ?)`,
      [month, day, protein, vegetable, grain])
  }

  getAll() {
    return this.dao.all(`SELECT * FROM main ORDER BY month, day`)
  }

}
