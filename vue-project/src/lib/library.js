import { mediaKey, historyKey } from "./media.js";

// Apply an intent to the latest server data. Local state changes only after commit.
export function changeLibrary(current, command) {
  const movies = [...current.movies];
  const watched = [...current.watched];
  const { item, kind } = command;
  const key = item && mediaKey(item);
  const index = movies.findIndex((movie) => mediaKey(movie) === key);
  const historyIndex = item && watched.findIndex((movie) => historyKey(movie) === historyKey(item));
  let result = null;
  if (kind === "add") {
    result = index === -1 ? "added" : "duplicate";
    if (index === -1) movies.push(item);
  } else if (kind === "remove") {
    if (index !== -1) result = { item: movies.splice(index, 1)[0], index };
  } else if (kind === "watch") {
    if (index !== -1) movies.splice(index, 1);
    result = watched.find((movie) => mediaKey(movie) === key);
    if (!result) {
      result = { ...item, watchedAt: command.watchedAt, entryId: command.entryId, rating: null };
      watched.push(result);
    }
  } else if (kind === "unwatch") {
    if (historyIndex !== -1) result = { item: watched.splice(historyIndex, 1)[0], index: historyIndex };
  } else if (kind === "rate") {
    if (historyIndex !== -1) {
      watched[historyIndex] = { ...watched[historyIndex], rating: command.rating };
      result = true;
    }
  } else if (kind === "restore") {
    if (command.collection === "movies") {
      if (index === -1) movies.splice(Math.min(command.index, movies.length), 0, item);
    } else if (historyIndex === -1) {
      watched.splice(Math.min(command.index, watched.length), 0, item);
    }
    result = true;
  } else throw new Error("Unknown library action");
  return { movies, watched, result };
}

// Firestore retries conflicts; both documents commit together or neither does.
export async function commitLibraryChange(transaction, refs, command) {
  const list = await transaction.get(refs.movies);
  const history = await transaction.get(refs.watched);
  const movies = list.exists() ? list.data().movies : [];
  const watched = history.exists() ? history.data().watched : [];
  if (!Array.isArray(movies) || !Array.isArray(watched)) throw new Error("Invalid library data");
  const next = changeLibrary({ movies, watched }, command);
  transaction.set(refs.movies, { movies: next.movies });
  transaction.set(refs.watched, { watched: next.watched });
  return next;
}
