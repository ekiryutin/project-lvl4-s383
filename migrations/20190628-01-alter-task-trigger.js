/* -- since sqlite3 v.3.24
  INSERT INTO "TaskSummary" ("userId", "statusId", "amount")
  VALUES ((case when NEW."statusId" in (3)
                then NEW."authorId" else NEW."executorId" end), NEW."statusId", 1)
  ON CONFLICT("userId", "statusId") DO UPDATE SET "amount" = "amount" + 1; */

const sqliteTriggers = [
  `
CREATE TRIGGER Tasks_AI_Status
AFTER INSERT ON "Tasks"
FOR EACH ROW
BEGIN  
  UPDATE "TaskSummary" SET "amount" = "amount" + 1
  where "userId" = (case when NEW."statusId" in (3) then NEW."authorId" else NEW."executorId" end)
  and "statusId" = NEW."statusId";
  
  INSERT OR IGNORE INTO "TaskSummary" ("userId", "statusId", "amount")
  VALUES ((case when NEW."statusId" in (3) then NEW."authorId" else NEW."executorId" end), NEW."statusId", 1);  
END;`,

  `
CREATE TRIGGER Tasks_AU_Status
AFTER UPDATE ON "Tasks"
FOR EACH ROW
BEGIN
  UPDATE "TaskSummary" SET "amount" = "amount" - 1
  where "userId" = (case when OLD."statusId" is 3 then OLD."authorId" else OLD."executorId" end)
  and "statusId" = OLD."statusId";  
  
  /* INSERT OR IGNORE INTO "TaskSummary" ("userId", "statusId", "amount")
   VALUES ((case when OLD."statusId" is 3 then OLD."authorId" else OLD."executorId" end), OLD."statusId", 0); */

  UPDATE "TaskSummary" SET "amount" = "amount" + 1
  where "userId" = (case when NEW."statusId" in (3) then NEW."authorId" else NEW."executorId" end)
  and "statusId" = NEW."statusId";
  
  INSERT OR IGNORE INTO "TaskSummary" ("userId", "statusId", "amount")
  VALUES ((case when NEW."statusId" in (3) then NEW."authorId" else NEW."executorId" end), NEW."statusId", 1);  
END;`,

  `
CREATE TRIGGER Tasks_AD_Status
AFTER DELETE ON "Tasks"
FOR EACH ROW
BEGIN
  UPDATE "TaskSummary" SET "amount" = "amount" - 1
  where "userId" = (case when OLD."statusId" is 3 then OLD."authorId" else OLD."executorId" end)
  and "statusId" = OLD."statusId";  
  
  /* INSERT OR IGNORE INTO "TaskSummary" ("userId", "statusId", "amount")
  VALUES ((case when OLD."statusId" is 3 then OLD."authorId" else OLD."executorId" end), OLD."statusId", 0); */
END;`];

const postgresTriggers = [
  `
CREATE OR REPLACE FUNCTION TaskSummary_increase(nUserId INTEGER, nStatusId INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE "TaskSummary" SET "amount" = "amount" + 1 
  WHERE "userId" = nUserId AND "statusId" = nStatusId;
  
  IF FOUND THEN
    RETURN;
  END IF;

  BEGIN
    INSERT INTO "TaskSummary" ("userId", "statusId", "amount")
    VALUES (nUserId, nStatusId, 1);
  EXCEPTION 
    WHEN UNIQUE_VIOLATION THEN -- если параллельно кто-то другой вставил запись 
      UPDATE "TaskSummary" SET "amount" = "amount" + 1 
      WHERE "userId" = nUserId AND "statusId" = nStatusId;
  END;
  RETURN;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION TaskSummary_decrease(nUserId INTEGER, nStatusId INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE "TaskSummary" SET "amount" = "amount" - 1 
  WHERE "userId" = nUserId AND "statusId" = nStatusId;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION TaskSummary_insert()
RETURNS TRIGGER AS $$
BEGIN
  execute TaskSummary_increase( 
    CASE 
      when NEW."statusId" in (select "fromId" from "StatusTransitions" where "access" = 'author')
      then NEW."authorId"
      else NEW."executorId"
    END,
    NEW."statusId");
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER Tasks_AI_Status
AFTER INSERT ON "Tasks"
FOR EACH ROW
EXECUTE PROCEDURE TaskSummary_insert();
`,

  `
CREATE OR REPLACE FUNCTION TaskSummary_update()
RETURNS TRIGGER AS $$
BEGIN
  execute TaskSummary_decrease( 
    CASE 
      when OLD."statusId" in (select "fromId" from "StatusTransitions" where "access" = 'author')
      then OLD."authorId"
      else OLD."executorId"
    END,
    OLD."statusId");

  IF NEW."deletedAt" is not null THEN
    RETURN NEW;
  END IF;
  
  execute TaskSummary_increase( 
    CASE 
      when NEW."statusId" in (select "fromId" from "StatusTransitions" where "access" = 'author')
      then NEW."authorId"
      else NEW."executorId"
    END,
    NEW."statusId");

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER Tasks_AU_Status
AFTER UPDATE ON "Tasks"
FOR EACH ROW
EXECUTE PROCEDURE TaskSummary_update();
`,

  `
CREATE OR REPLACE FUNCTION TaskSummary_delete()
RETURNS TRIGGER AS $$
BEGIN
  execute TaskSummary_decrease( 
    CASE 
      when OLD."statusId" in (select "fromId" from "StatusTransitions" where "access" = 'author')
      then OLD."authorId"
      else OLD."executorId"
    END,
    OLD."statusId");
    
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER Tasks_AD_Status
AFTER DELETE ON "Tasks"
FOR EACH ROW
EXECUTE PROCEDURE TaskSummary_delete();
`];


const createTrigger = (dialect, n) => {
  switch (dialect) {
    case 'sqlite':
      return sqliteTriggers[n];

    case 'postgres':
      return postgresTriggers[n];

    default:
      console.log(`Define trigger for '${dialect}' dialect`);
      return '';
  }
};

const dropTrigger = (dialect, triggerName) => {
  switch (dialect) {
    case 'sqlite':
      return `DROP TRIGGER ${triggerName};`;

    case 'postgres':
      return `DROP TRIGGER ${triggerName} on "Tasks";`;

    default:
      console.log(`Define trigger for '${dialect}' dialect`);
      return '';
  }
};

module.exports = {
  up: queryInterface => queryInterface.sequelize
    .query(createTrigger(queryInterface.sequelize.getDialect(), 0))
    .then(() => queryInterface.sequelize
      .query(createTrigger(queryInterface.sequelize.getDialect(), 1)))
    .then(() => queryInterface.sequelize
      .query(createTrigger(queryInterface.sequelize.getDialect(), 2))),

  down: queryInterface => queryInterface.sequelize
    .query(dropTrigger(queryInterface.sequelize.getDialect(), 'Tasks_AI_Status'))
    .then(() => queryInterface.sequelize.query(dropTrigger(queryInterface.sequelize.getDialect(), 'Tasks_AU_Status')))
    .then(() => queryInterface.sequelize.query(dropTrigger(queryInterface.sequelize.getDialect(), 'Tasks_AD_Status'))),
};
