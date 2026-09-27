# Trailer sources

Where each movie's trailer comes from (mock mode, `mock-server/db.json` -> `trailer_key`).
Every trailer is the **official upload of the studio / distributor** (or a trailer channel such as
Rotten Tomatoes), hosted on YouTube and played in a controls-free embed.

**How they were found:** `scripts/fetch-trailers.mjs` searched YouTube for "<title> <year> official trailer" and
accepted a video only if YouTube's oEmbed confirmed it is public/embeddable and its title contains the movie name
and "trailer" or "teaser". Channel names below come from that oEmbed response. Dune: Part Two was checked by hand.

| # | Movie | Year | Trailer video title | Source channel | Link |
|---|---|---|---|---|---|
| 1 | Inception | 2010 | Inception (2010) Official Trailer #1 - Christopher Nolan Movie HD | Rotten Tomatoes Classic Trailers | [YoHD9XEInc0](https://www.youtube.com/watch?v=YoHD9XEInc0) |
| 2 | The Dark Knight | 2008 | The Dark Knight (2008) Official Trailer #1 - Christopher Nolan Movie HD | Rotten Tomatoes Classic Trailers | [EXeTwQWrcwY](https://www.youtube.com/watch?v=EXeTwQWrcwY) |
| 3 | Interstellar | 2014 | Interstellar - Trailer - Official Warner Bros. UK | Warner Bros. UK & Ireland | [zSWdZVtXT7E](https://www.youtube.com/watch?v=zSWdZVtXT7E) |
| 4 | The Shawshank Redemption | 1994 | The Shawshank Redemption (1994) Official Trailer #1 - Morgan Freeman Movie HD | Rotten Tomatoes Classic Trailers | [NmzuHjWmXOc](https://www.youtube.com/watch?v=NmzuHjWmXOc) |
| 5 | Pulp Fiction | 1994 | Pulp Fiction Official Trailer #1 - (1994) HD | Movieclips | [s7EdQ4FqbhY](https://www.youtube.com/watch?v=s7EdQ4FqbhY) |
| 6 | The Matrix | 1999 | The Matrix (1999) Official Trailer #1 - Sci-Fi Action Movie | Rotten Tomatoes Classic Trailers | [vKQi3bBA1y8](https://www.youtube.com/watch?v=vKQi3bBA1y8) |
| 7 | Gladiator | 2000 | GLADIATOR \| Official Trailer \| Paramount Movies | Paramount Movies | [P5ieIbInFpg](https://www.youtube.com/watch?v=P5ieIbInFpg) |
| 8 | Parasite | 2019 | PARASITE - Official Trailer – In Theaters 10.11.2019 | NEON | [isOGD_7hNIY](https://www.youtube.com/watch?v=isOGD_7hNIY) |
| 9 | Avengers: Endgame | 2019 | Marvel Studios' Avengers: Endgame - Official Trailer | Marvel Entertainment | [TcMBFSGVi1c](https://www.youtube.com/watch?v=TcMBFSGVi1c) |
| 10 | The Godfather | 1972 | THE GODFATHER \| 50th Anniversary Trailer \| Paramount Pictures | Paramount Pictures | [UaVTIH8mujA](https://www.youtube.com/watch?v=UaVTIH8mujA) |
| 11 | Spider-Man: Into the Spider-Verse | 2018 | SPIDER-MAN: INTO THE SPIDER-VERSE - Official Trailer (HD) | Sony Pictures Entertainment | [g4Hbz2jLxvQ](https://www.youtube.com/watch?v=g4Hbz2jLxvQ) |
| 12 | Joker | 2019 | JOKER - Final Trailer - Now Playing In Theaters | Warner Bros. | [zAGVQLHvwOY](https://www.youtube.com/watch?v=zAGVQLHvwOY) |
| 13 | Top Gun: Maverick | 2022 | Top Gun: Maverick - Official Trailer (2022) - Paramount Pictures | Paramount Pictures | [qSqVVswa420](https://www.youtube.com/watch?v=qSqVVswa420) |
| 14 | Avengers: Doomsday | 2026 | Avengers: Doomsday \| Official Trailer \| In Theaters December 18 | Marvel Entertainment | [irVNGjRFZGk](https://www.youtube.com/watch?v=irVNGjRFZGk) |
| 15 | Spider-Man: Brand New Day | 2026 | SPIDER-MAN: BRAND NEW DAY – New Trailer (4K) | Sony Pictures Entertainment | [62bIsvRcPv0](https://www.youtube.com/watch?v=62bIsvRcPv0) |
| 16 | Toy Story 5 | 2026 | Toy Story 5 \| Official Trailer \| In Theaters June 19 | Pixar | [c51ND9Hdbw0](https://www.youtube.com/watch?v=c51ND9Hdbw0) |
| 17 | The Mandalorian and Grogu | 2026 | The Mandalorian and Grogu \| Official Trailer \| In Theaters May 22 | Star Wars | [IHWlvwu8t1w](https://www.youtube.com/watch?v=IHWlvwu8t1w) |
| 18 | Supergirl | 2026 | Supergirl \| Official Trailer | DC | [s1-pfiVMKAs](https://www.youtube.com/watch?v=s1-pfiVMKAs) |
| 19 | Dune: Part Three | 2026 | Dune: Part Three \| Official Trailer | Warner Bros. | [NdvqHc56lE0](https://www.youtube.com/watch?v=NdvqHc56lE0) |
| 20 | The Odyssey | 2026 | The Odyssey \| Official New Trailer | Universal Pictures | [f_bKjZeJBBI](https://www.youtube.com/watch?v=f_bKjZeJBBI) |
| 21 | Moana | 2026 | Moana \| "Official Trailer" \| In Theaters July 10 | Disney | [n7f6hlKsxxo](https://www.youtube.com/watch?v=n7f6hlKsxxo) |
| 22 | Michael | 2026 | Michael (2026) Official Trailer - Jaafar Jackson | Lionsgate Movies | [mbtgEE6rkxw](https://www.youtube.com/watch?v=mbtgEE6rkxw) |
| 23 | The Super Mario Galaxy Movie | 2026 | The Super Mario Galaxy Movie – Official Trailer | Nintendo of America | [GuCejewteF8](https://www.youtube.com/watch?v=GuCejewteF8) |
| 24 | Project Hail Mary | 2026 | Project Hail Mary - Official Trailer | Amazon MGM Studios | [m08TxIsFTRI](https://www.youtube.com/watch?v=m08TxIsFTRI) |
| 25 | The Devil Wears Prada 2 | 2026 | The Devil Wears Prada 2 \| Official Trailer | 20th Century Studios | [e9HXmMnUEdE](https://www.youtube.com/watch?v=e9HXmMnUEdE) |
| 26 | Dune: Part Two | 2024 | Dune: Part Two \| Official Trailer | Warner Bros. | [Way9Dexny3w](https://www.youtube.com/watch?v=Way9Dexny3w) |
| 27 | Inside Out 2 | 2024 | Inside Out 2 \| Official Trailer | Pixar | [LEjhY15eCx0](https://www.youtube.com/watch?v=LEjhY15eCx0) |
| 28 | Deadpool & Wolverine | 2024 | Deadpool & Wolverine \| Official Trailer \| In Theaters July 26 | Marvel Entertainment | [73_1biulkYk](https://www.youtube.com/watch?v=73_1biulkYk) |
| 29 | Wicked | 2024 | Wicked - Official Trailer | Universal Pictures | [6COmYeLsz4c](https://www.youtube.com/watch?v=6COmYeLsz4c) |
| 30 | Anora | 2024 | Anora Trailer #1 (2024) | Rotten Tomatoes Trailers | [GuPkfvxmtdw](https://www.youtube.com/watch?v=GuPkfvxmtdw) |
| 31 | Sinners | 2025 | Sinners \| Official Trailer | Warner Bros. | [bKGxHflevuk](https://www.youtube.com/watch?v=bKGxHflevuk) |
| 32 | Superman | 2025 | Superman \| Official Trailer \| DC | DC | [Ox8ZLF6cGM0](https://www.youtube.com/watch?v=Ox8ZLF6cGM0) |
| 33 | F1 | 2025 | F1 \| Official Trailer | FORMULA 1 | [69ffwl-8pCU](https://www.youtube.com/watch?v=69ffwl-8pCU) |
| 34 | Oppenheimer | 2023 | Oppenheimer \| New Trailer | Universal Pictures | [uYPbbksJxIg](https://www.youtube.com/watch?v=uYPbbksJxIg) |
| 35 | Barbie | 2023 | Barbie \| Main Trailer | Warner Bros. | [pBk4NYhWNMM](https://www.youtube.com/watch?v=pBk4NYhWNMM) |
| 36 | Mission: Impossible – The Final Reckoning | 2025 | Mission: Impossible – The Final Reckoning \| Official Trailer (2025 Movie) - Tom Cruise | Paramount Pictures | [fsQgc9pCyDU](https://www.youtube.com/watch?v=fsQgc9pCyDU) |
| 37 | Zootopia 2 | 2025 | Zootopia 2 \| Trailer | Walt Disney Animation Studios | [BjkIOU5PhyQ](https://www.youtube.com/watch?v=BjkIOU5PhyQ) |

With a TMDB API key the app ignores this table and looks up each movie's trailer from TMDB's
`/movie/{id}/videos` instead (see [DATA_SOURCES.md](DATA_SOURCES.md)).
