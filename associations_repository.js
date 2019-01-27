class AssociationsRepository {
  constructor(dao) {
    this.dao = dao
  }

  // createTable - including unique IDs for these associations? not necessary right
  createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS associations (
        mainId INTEGER,
        tagsTag TEXT,
        CONSTRAINT associations_fk_mainId FOREIGN KEY (mainId)
          REFERENCES main(id) ON UPDATE CASCADE ON DELETE CASCADE,
        CONSTRAINT tasks_fk_tagsTag FOREIGN KEY (tagsTag)
        REFERENCES tags(tag) ON UPDATE CASCADE ON DELETE CASCADE)`
    return this.dao.run(sql)
  }

// create - not sure if should manually create this?
  create(mainId, tagsTag) {
    return this.dao.run(
      `INSERT INTO associations (mainId, tagsTag)
        VALUES (?, ?)`,
      [mainId, tagsTag])
  }

  // skipping the update and delete for now
}
