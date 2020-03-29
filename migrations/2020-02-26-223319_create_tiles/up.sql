-- Your SQL goes here
CREATE TABLE "tiles" (
	"id"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	"title"	TEXT NOT NULL,
	"mpv"	TEXT NOT NULL,
	"prempv"	TEXT NOT NULL,
	"postmpv"	TEXT NOT NULL,
	"loopmpv"	TEXT NOT NULL,
	"day"	INTEGER NOT NULL,
	"time"	TEXT NOT NULL,
	"duration"	REAL NOT NULL,
	"color"	INTEGER NOT NULL
);
