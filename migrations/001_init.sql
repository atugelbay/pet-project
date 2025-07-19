CREATE TABLE IF NOT EXISTS users (
    id  SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS chats (
    id  SERIAL PRIMARY KEY,
    title   TEXT,
    is_group    BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS chat_members (
    chat_id INT REFERENCES chats(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (chat_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    chat_id INT REFERENCES chats(id) ON DELETE CASCADE,
    sender_id INT REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS posts (
  id    SERIAL PRIMARY KEY,
  author_id INT REFERENCES users(id),
  title TEXT NOT NULL,
  body  TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);