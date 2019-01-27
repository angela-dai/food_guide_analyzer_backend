class TagsRepository {
  constructor(dao) {
    this.dao = dao
  }

  // createTable - id INTEGER PRIMARY KEY AUTOINCREMENT, not sure if we should include that?
  // calories?
  createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS tags (
        tag TEXT NOT NULL UNIQUE)`
    return this.dao.run(sql)
  }

  create(tag) {
    return this.dao.run(
      `INSERT INTO tags (tag) VALUES (?)`,
      [tag])
  }

  // skipping the update and delete for now
}
