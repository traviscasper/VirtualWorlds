# ARCHIVE: Worlds Within Worlds — Recording Script

Generated from the film (335 lines). Times are positions in the finished 90-minute film.

## How to record and add lines

1. Record each line as a WAV file (any sample rate, mono or stereo, 16/24-bit or 32-bit float). Leave about 0.2 s of silence at the start.
2. Name the file with the line's ID, for example `NARR-01.wav` or `CH05_SC03-04.wav`.
3. Put the files in the `vo/` folder. The renderer places each one at its moment in the film and removes the placeholder chirps for that line. To preview in the studio, use **Recorded lines** in the Render and export panel.
4. Lines stay in sync even if scenes are re-paced, because each line is pinned to its story moment.
5. **Delivery:** the time column shows the space available. Shorter is fine, and a little longer usually is too.

## Adding your own music
Put WAV files in `music/` with a `cues.json` like:
```json
[ {"file":"opening_theme.wav", "scene":"CH01_SC01", "offset":0, "gain":0.9, "replace":true},
  {"file":"finale.wav", "scene":"CH10_SC03", "offset":12, "gain":1.0, "replace":true} ]
```
`scene` is a scene ID from the table below (or use `"story": seconds`), `offset` is seconds into that scene, `replace:true` mutes the generated score while your track plays, and `fade` is the fade in/out in seconds (default 1). In the studio, load the WAVs and `cues.json` together with **Your music**.

## Characters

- **NARRATOR**: a warm storyteller, not a character in the film. Unhurried and kind, like reading to someone you love.
- **ARCHIVE**: a small, curious, brave robot. Bright, quick, sometimes cheeky. Grows steadier through the film.
- **TOCK**: a small, fussy courier drone. Clipped and precise; loves rules. Secretly very loyal.
- **ALICIA**: the Loom's holographic AI. Calm, warm, a little sad until the end.
- **CITY**: Ferrum's public-address system. Flat, official.
- **WARDEN**: a starving maintenance drone. Low, mechanical, few words.

## Scene IDs

| Scene | Title |
|---|---|
| CH01_SC01 | Two points of light |
| CH01_SC02 | Power-up |
| CH01_SC03 | The Archive revealed |
| CH01_SC04 | The mirror panel |
| CH01_SC05 | A world in a sphere |
| CH01_SC06 | Worlds within worlds |
| CH01_SC07 | The orb remembers |
| CH01_SC08 | The door that wasn’t there |
| CH01_SC09 | Into the portal |
| CH02_SC01 | Arrival in Verdance |
| CH02_SC02 | Tock’s tour |
| CH02_SC03 | The flicker |
| CH03_SC01 | The Orrery |
| CH03_SC02 | Inside a world |
| CH03_SC03 | The glimpse |
| CH04_SC01 | Ferrum |
| CH04_SC02 | The machine |
| CH04_SC03 | The leak |
| CH05_SC01 | Thalassa |
| CH05_SC02 | Making it worse |
| CH05_SC03 | The light exchange |
| CH06_SC01 | The Loom |
| CH06_SC02 | Alicia |
| CH06_SC03 | The map |
| CH07_SC01 | Shattered |
| CH07_SC02 | The choice |
| CH07_SC03 | Alone |
| CH08_SC01 | The Heartstar |
| CH08_SC02 | The memory |
| CH08_SC03 | The Seat |
| CH09_SC01 | Alone at the Seat |
| CH09_SC02 | Every world answers |
| CH09_SC03 | Free |
| CH10_SC01 | Homecomings |
| CH10_SC02 | Farewell |
| CH10_SC03 | A new beginning |

## NARRATOR (13 lines)

| ID | Time | Length | Emotion | Line |
|---|---|---|---|---|
| NARR-01 | 0:01.0 | 7.3 s | warm storyteller | Long ago, every world was connected by a network of light called the Loom. Its rhythm kept them all in time. |
| NARR-02 | 0:14.5 | 6.9 s | warm storyteller | But the rhythm was failing. And deep in a forgotten Archive, the one who once kept it… was waking up. |
| NARR-03 | 1:10.7 | 8.2 s | warm storyteller | The tiny world was a map. It showed the four shards of the Keystone — the only thing that could restart the Loom’s heart. |
| NARR-04 | 9:10.1 | 6.9 s | warm storyteller | The first shard was hidden in Verdance, the First World — a city that gives back everything it takes. |
| NARR-05 | 18:01.0 | 5.8 s | warm storyteller | Between the worlds turns the Orrery, where every world holds another world inside it. |
| NARR-06 | 26:42.4 | 6.5 s | warm storyteller | The second shard lay in Ferrum, a city of power… and of hunger. Someone was draining its light. |
| NARR-07 | 35:22.7 | 6.1 s | warm storyteller | The third shard lay beneath Thalassa’s sea, guarded by a reef that remembered everything. |
| NARR-08 | 44:58.3 | 6.3 s | warm storyteller | With three shards, ARCHIVE could finally see the Loom itself — and the one hiding inside it. |
| NARR-09 | 54:10.6 | 6.3 s | warm storyteller | The last shard waited beyond every map, in the Lost Worlds, where the storm had already won. |
| NARR-10 | 63:22.0 | 7.5 s | warm storyteller | At the Core waited Magnus, the oldest of the Wardens. Afraid of going dark, he had taken the light for himself. |
| NARR-11 | 71:43.6 | 4.4 s | warm storyteller | One robot could not hold the Loom. But no one was ever meant to. |
| NARR-12 | 81:20.1 | 5.3 s | warm storyteller | And so the worlds were connected again — not by one heart, but by all of them. |
| NARR-13 | 88:13.0 | 4.1 s | warm storyteller | Every world is connected. And every door… is a new beginning. |

## ARCHIVE (168 lines)

| ID | Time | Length | Emotion | Line |
|---|---|---|---|---|
| CH01_SC01-01 | 0:12.9 | 0.8 s | curious | …hello? |
| CH01_SC03-01 | 0:38.0 | 0.9 s | surprised | Whoa. |
| CH01_SC04-01 | 1:01.6 | 0.6 s | surprised | Eep! |
| CH01_SC04-02 | 1:08.7 | 1.6 s | happy | Heh. That’s me. |
| CH01_SC05-01 | 1:26.4 | 1.0 s | curious | What are you? |
| CH01_SC05-02 | 1:35.7 | 0.9 s | relieved | …oops. |
| CH01_SC07-01 | 2:17.5 | 1.4 s | surprised | Whoa… |
| CH01_SC07-02 | 2:42.5 | 1.8 s | happy | They’re all… connected. |
| CH01_SC07-03 | 2:50.5 | 0.8 s | worried | No— |
| CH01_SC07-04 | 3:14.2 | 1.6 s | curious | Where are you going? |
| CH01_SC08-01 | 4:08.5 | 1.0 s | proud | Ha! |
| CH01_SC08-02 | 4:48.2 | 0.8 s | surprised | Huh? |
| CH01_SC08-03 | 5:16.0 | 1.2 s | curious | …A door? |
| CH01_SC09-01 | 6:12.0 | 1.5 s | worried | If I go… |
| CH01_SC09-02 | 6:29.4 | 1.8 s | happy | Okay. I’ll come back. |
| CH01_SC09-03 | 6:42.0 | 1.0 s | happy | Bye! |
| CH01_SC09-04 | 7:07.0 | 1.6 s | determined | Okay. Let’s go see. |
| CH01_INS1-01 | 7:18.6 | 1.4 s | curious | Uh… hello? |
| CH01_INS1-03 | 7:24.0 | 1.2 s | worried | Nope! Nope! |
| CH01_INS1-04 | 7:44.4 | 1.4 s | playful | Sorry! |
| CH01_INS1-05 | 7:52.0 | 2.6 s | sad | It’s not angry… it’s out of power. |
| CH01_INS1-06 | 8:00.0 | 2.2 s | determined | I’ll come back for you too. |
| CH01_SC09-05 | 8:37.9 | 1.6 s | excited | Wheeee! |
| CH02_SC01-01 | 9:20.1 | 1.2 s | surprised | Whoa… |
| CH02_SC01-02 | 10:04.3 | 0.8 s | excited | Hi! |
| CH02_SC01-03 | 10:35.3 | 1.0 s | playful | Again! |
| CH02_SC01-05 | 10:57.9 | 1.4 s | confused | Um… exploring? |
| CH02_SC01-08 | 11:19.7 | 0.6 s | excited | Yes! |
| CH02_SC01-10 | 11:46.0 | 1.6 s | happy | It’s… a whole world. |
| CH02_SC02-04 | 12:45.8 | 1.0 s | sad | Sorry… |
| CH02_SC02-06 | 12:56.0 | 1.4 s | excited | A shard! |
| CH02_SC02-08 | 13:16.6 | 1.0 s | excited | Wheee! |
| CH02_INS1-02 | 13:56.2 | 1.2 s | playful | Just once! |
| CH02_INS1-03 | 14:01.8 | 1.6 s | excited | Wheeeee! |
| CH02_INS1-05 | 14:07.8 | 1.2 s | worried | Is that bad? |
| CH02_INS1-07 | 14:13.6 | 1.0 s | confused | …Ow. |
| CH02_INS1-09 | 14:17.8 | 1.2 s | happy | Worth it. |
| CH02_SC03-02 | 15:40.6 | 2.4 s | thinking | Three pulses. Just like home. |
| CH02_SC03-07 | 16:51.8 | 1.8 s | excited | There are more worlds… |
| CH02_SC03-08 | 16:58.2 | 1.6 s | curious | Come with me? |
| CH02_SC03-12 | 17:18.2 | 0.8 s | excited | Yes! |
| CH02_SC03-13 | 17:30.9 | 1.6 s | determined | Okay, Tock. Let’s go see. |
| CH03_SC01-01 | 18:08.0 | 1.4 s | surprised | Whoa… |
| CH03_SC01-04 | 18:28.6 | 1.6 s | curious | Ooh… an ocean! |
| CH03_SC01-05 | 18:42.6 | 1.6 s | thinking | It’s so… sandy. |
| CH03_SC01-06 | 18:57.6 | 1.6 s | excited | Floating islands! |
| CH03_SC01-07 | 19:13.9 | 1.6 s | surprised | Whoa, shiny. |
| CH03_SC01-09 | 19:29.3 | 1.6 s | curious | Someone lives here. |
| CH03_SC01-10 | 19:48.2 | 2.0 s | happy | They’re connected. Like at home. |
| CH03_SC01-13 | 20:31.6 | 1.6 s | playful | Watch this. |
| CH03_SC02-02 | 20:46.2 | 1.2 s | excited | Let’s go in! |
| CH03_SC02-03 | 20:57.2 | 1.6 s | excited | We’re inside it! |
| CH03_SC02-05 | 21:46.3 | 1.0 s | surprised | Oh! |
| CH03_SC02-07 | 22:12.3 | 1.4 s | happy | It likes me! |
| CH03_INS1-02 | 22:17.3 | 1.4 s | excited | You’re on! |
| CH03_INS1-04 | 22:32.3 | 1.2 s | surprised | Hey! |
| CH03_INS1-05 | 22:40.3 | 1.6 s | frustrated | That’s cheating! |
| CH03_SC02-09 | 23:10.9 | 1.4 s | thinking | A world. Inside a world. |
| CH03_SC02-11 | 23:39.4 | 2.6 s | excited | Worlds… inside worlds… inside worlds! |
| CH03_SC02-13 | 24:13.4 | 1.8 s | happy | Best day ever. |
| CH03_SC03-02 | 24:49.0 | 1.6 s | curious | Wait—who are you? |
| CH03_SC03-04 | 25:56.4 | 1.4 s | thinking | Red. Hm. |
| CH03_SC03-06 | 26:02.0 | 2.2 s | happy | Deliver the visitor safely. |
| CH04_SC01-01 | 26:50.0 | 1.2 s | surprised | Whoa… |
| CH04_SC01-04 | 27:04.4 | 1.4 s | playful | Not this one! |
| CH04_SC01-07 | 28:09.2 | 1.6 s | determined | We have to help. |
| CH04_SC01-08 | 28:24.2 | 2.2 s | thinking | Too much here… nothing there. |
| CH04_SC01-10 | 28:41.8 | 1.2 s | excited | I know! |
| CH04_SC01-12 | 29:08.4 | 2.2 s | determined | It needs… a few parts. |
| CH04_SC01-14 | 29:18.0 | 1.0 s | playful | Lots. |
| CH04_SC02-02 | 29:54.2 | 1.4 s | playful | It… helps! |
| CH04_SC02-03 | 30:19.6 | 1.0 s | excited | Yes! |
| CH04_SC02-07 | 31:23.1 | 1.6 s | excited | Share it! |
| CH04_INS1-02 | 31:47.5 | 2.0 s | playful | Then they’ll have to catch me! |
| CH04_INS1-03 | 32:00.5 | 1.6 s | determined | Tock—when I say now… |
| CH04_INS1-05 | 32:02.8 | 0.6 s | determined | NOW! |
| CH04_INS1-06 | 32:05.9 | 2.4 s | warm | Sorry! You’ll get your share. I promise. |
| CH04_INS1-08 | 32:13.1 | 1.0 s | playful | …Mostly. |
| CH04_SC02-11 | 32:46.5 | 1.8 s | proud | Simplest route. |
| CH04_SC03-02 | 33:33.0 | 2.8 s | worried | It’s going… up. And it’s not coming back. |
| CH04_SC03-05 | 33:44.0 | 1.4 s | surprised | It’s her! |
| CH04_SC03-07 | 33:49.0 | 2.4 s | determined | I don’t know. But she needs help. |
| CH04_SC03-10 | 34:44.5 | 1.4 s | happy | My favourite kind. |
| CH05_SC01-01 | 35:30.7 | 1.4 s | surprised | Whoa… |
| CH05_SC01-03 | 35:41.7 | 2.0 s | excited | Gardens… in towers! |
| CH05_SC01-04 | 36:18.2 | 1.4 s | excited | It’s glowing! |
| CH05_SC01-06 | 37:31.0 | 2.0 s | worried | Hey… are you okay? |
| CH05_SC02-01 | 38:12.5 | 1.8 s | determined | Here. Take some light! |
| CH05_SC02-03 | 38:38.3 | 1.4 s | worried | No, no, no— |
| CH05_SC02-05 | 40:12.0 | 2.2 s | thinking | They’re… talking. In threes. |
| CH05_SC02-06 | 40:22.0 | 2.6 s | sad | And it’s too far away to hear them. |
| CH05_SC02-08 | 40:46.0 | 2.2 s | relieved | We wait. And we listen. |
| CH05_SC03-02 | 42:27.8 | 3.6 s | relieved | It didn’t need fixing. It needed someone to answer. |
| CH05_INS1-02 | 42:57.0 | 1.4 s | curious | Down there? |
| CH05_INS1-03 | 43:00.8 | 1.4 s | excited | Wheee—blub! |
| CH05_INS1-05 | 43:21.0 | 1.2 s | excited | Three! |
| CH05_INS1-07 | 43:42.0 | 1.6 s | happy | Thank you! |
| CH05_SC03-03 | 44:08.7 | 2.6 s | surprised | It’s everywhere… it’s all one network. |
| CH05_SC03-05 | 44:22.7 | 1.6 s | determined | Then we go up. |
| CH06_SC01-01 | 45:06.3 | 2.0 s | surprised | We’re inside the network… |
| CH06_SC01-03 | 45:43.8 | 2.2 s | thinking | They’re all going the same way. |
| CH06_SC01-04 | 46:00.4 | 1.2 s | excited | Verdance! Hi! |
| CH06_SC01-06 | 46:26.2 | 1.8 s | happy | The reef… Lumen’s okay. |
| CH06_SC01-08 | 47:05.8 | 2.4 s | worried | It’s worse than Ferrum. Worse than Thalassa. |
| CH06_SC02-02 | 48:05.7 | 2.0 s | curious | You’re… her. From the panel. |
| CH06_SC02-07 | 48:57.6 | 2.0 s | determined | Then that’s where we go. |
| CH06_SC02-09 | 49:08.6 | 2.4 s | determined | Then hold on. We’re coming. |
| CH06_SC02-11 | 49:50.8 | 2.0 s | happy | Ferrum! They kept it shared! |
| CH06_INS1-02 | 50:05.8 | 2.0 s | excited | Hold on—let’s catch a pulse! |
| CH06_INS1-04 | 50:20.4 | 1.4 s | determined | Down we go! |
| CH06_INS1-06 | 50:32.8 | 1.6 s | playful | Pulses only go one way! |
| CH06_SC03-01 | 51:41.2 | 2.6 s | surprised | It’s… bigger than all the stars. |
| CH06_SC03-04 | 53:10.4 | 2.4 s | determined | Then we draw a new one. |
| CH07_SC01-01 | 54:22.6 | 1.6 s | worried | Where… are we? |
| CH07_SC01-03 | 54:35.6 | 2.4 s | sad | These were worlds. Pieces of worlds. |
| CH07_INS1-01 | 55:32.6 | 1.0 s | surprised | Wardens! |
| CH07_INS1-02 | 55:35.0 | 1.6 s | worried | Let go! Let GO! |
| CH07_INS1-04 | 55:51.6 | 1.6 s | warm | Thanks, partner. |
| CH07_SC01-05 | 56:26.4 | 2.4 s | worried | They’re coming loose… both of them. |
| CH07_SC01-07 | 57:15.9 | 2.2 s | determined | Hold on. I’ve got you. |
| CH07_SC02-02 | 58:10.1 | 2.0 s | frustrated | I have to—! |
| CH07_SC02-04 | 58:30.1 | 1.4 s | surprised | Tock! |
| CH07_SC02-07 | 58:52.2 | 1.6 s | sad | TOCK! |
| CH07_SC02-08 | 59:43.8 | 2.8 s | sad | I couldn’t hold them both. |
| CH07_SC02-09 | 60:19.9 | 2.2 s | relieved | The last shard… thank you. |
| CH07_SC03-01 | 60:44.1 | 2.2 s | sad | You said rule one… |
| CH07_SC03-02 | 61:00.8 | 2.6 s | determined | I’ll find you. After I fix this. |
| CH08_SC01-01 | 63:33.0 | 1.6 s | surprised | Whoa… |
| CH08_SC01-02 | 63:45.3 | 2.4 s | sad | Tock would have a rule for this. |
| CH08_SC01-03 | 64:26.3 | 2.6 s | worried | Everything flows in… and the panels are failing. |
| CH08_SC01-04 | 64:51.9 | 2.0 s | surprised | Even the light bends here. |
| CH08_SC01-05 | 65:26.7 | 2.4 s | surprised | That’s… my emblem. |
| CH08_SC01-07 | 65:53.1 | 2.4 s | sad | Tock… the storm took Tock. |
| CH08_SC02-07 | 67:26.4 | 2.4 s | sad | You were holding it alone. All this time. |
| CH08_SC03-03 | 69:15.4 | 2.2 s | happy | Verdance… Thalassa… Ferrum… |
| CH08_SC03-04 | 69:34.6 | 3.0 s | soft | Tock would say: deliver the visitor safely. |
| CH08_SC03-05 | 69:39.6 | 2.4 s | determined | All of them are my visitors. |
| CH08_SC03-06 | 69:47.6 | 2.8 s | determined | Then I’ll hold it. As long as it takes. |
| CH08_SC03-08 | 70:15.5 | 1.6 s | determined | I’m ready. |
| CH09_SC01-01 | 71:56.6 | 2.0 s | determined | Hold… hold… |
| CH09_SC01-03 | 72:30.8 | 2.0 s | frustrated | I won’t let go. |
| CH09_SC01-04 | 72:49.1 | 2.4 s | sad | I can’t… hold it… alone… |
| CH09_SC01-06 | 73:15.9 | 1.4 s | excited | TOCK! |
| CH09_SC01-08 | 73:31.9 | 2.2 s | happy | You came back. |
| CH09_SC01-10 | 73:58.5 | 2.2 s | excited | Verdance… is holding with me! |
| CH09_SC01-12 | 74:10.5 | 2.6 s | determined | Then let’s ask them all. |
| CH09_INS1-03 | 74:27.9 | 1.6 s | determined | Leave her alone! |
| CH09_INS1-04 | 74:33.5 | 2.2 s | sad | I can’t stop him alone… |
| CH09_INS1-05 | 74:38.1 | 2.6 s | excited | Verdance… Ferrum… Thalassa… everyone! |
| CH09_INS1-07 | 74:47.9 | 1.4 s | determined | Together! |
| CH09_INS1-10 | 75:19.1 | 2.6 s | warm | You don’t have to hold it alone. |
| CH09_SC02-03 | 76:19.0 | 2.6 s | excited | We’re holding it… together! |
| CH09_SC02-04 | 77:37.7 | 2.4 s | relieved | Every world… in time. |
| CH09_SC02-07 | 78:22.4 | 1.6 s | excited | I’m free! |
| CH09_SC03-02 | 78:56.5 | 2.2 s | happy | Because you’re not holding it alone. |
| CH09_SC03-04 | 79:11.5 | 1.6 s | happy | We did. |
| CH09_SC03-07 | 80:00.4 | 2.0 s | playful | I know a good courier. |
| CH10_SC01-01 | 81:29.5 | 1.4 s | playful | Hi, train! |
| CH10_SC01-02 | 81:39.1 | 2.4 s | happy | The far district’s bright again. |
| CH10_SC01-04 | 82:29.2 | 1.6 s | happy | Hi, Lumen. |
| CH10_SC01-06 | 82:54.2 | 1.8 s | excited | The trams are running! |
| CH10_SC01-08 | 83:21.1 | 2.2 s | relieved | It’s playing music again. |
| CH10_SC01-11 | 83:49.7 | 2.0 s | playful | With a little help. |
| CH10_SC02-02 | 84:33.0 | 1.8 s | happy | It’s beautiful, right? |
| CH10_SC02-05 | 84:50.0 | 1.8 s | sad | Will I see you again? |
| CH10_SC02-11 | 85:36.9 | 1.6 s | happy | Bye, Alicia. |
| CH10_SC02-13 | 86:08.5 | 2.4 s | playful | Somewhere… nobody’s been yet. |
| CH10_SC03-02 | 87:46.0 | 2.0 s | determined | Then let’s go see. |

## TOCK (113 lines)

| ID | Time | Length | Emotion | Line |
|---|---|---|---|---|
| CH02_SC01-04 | 10:54.7 | 2.4 s | stern | Unregistered unit! State your purpose. |
| CH02_SC01-06 | 11:00.3 | 2.2 s | stern | Exploring is not on the schedule. |
| CH02_SC01-07 | 11:15.7 | 3.2 s | grudging | …Fine. Courier rule seven: escort all visitors. |
| CH02_SC01-09 | 11:22.7 | 2.2 s | stern | Follow me. Stay in the lane. |
| CH02_SC02-01 | 12:13.4 | 3.0 s | stern | This is the Fountain Plaza. Do not touch the fountain. |
| CH02_SC02-02 | 12:30.1 | 1.4 s | panic | Stop! Stop! |
| CH02_SC02-03 | 12:41.8 | 3.0 s | stern | Rule one. Do. Not. Touch. |
| CH02_SC02-05 | 12:52.0 | 3.4 s | soft | …The fountain has never played music before. |
| CH02_SC02-07 | 13:02.8 | 2.6 s | soft | Faster on the tram. Come. |
| CH02_SC02-09 | 13:29.6 | 4.4 s | proud | Every tower grows food. Every canal cools the city. Everything gives back. |
| CH02_INS1-01 | 13:53.8 | 2.2 s | stern | Rule nine: do not ride on the roof. |
| CH02_INS1-04 | 14:05.8 | 1.6 s | panic | It is speeding up! |
| CH02_INS1-06 | 14:09.0 | 1.0 s | panic | BRAKES! |
| CH02_INS1-08 | 14:15.8 | 1.2 s | stern | Rule nine. |
| CH02_SC02-10 | 14:41.6 | 3.6 s | curious | That symbol… it’s on the old gate. At the edge of the city. |
| CH02_SC03-01 | 15:37.0 | 2.6 s | stern | Minor fluctuation. Within tolerance. |
| CH02_SC03-03 | 15:43.8 | 1.0 s | curious | Home? |
| CH02_SC03-04 | 15:52.2 | 1.6 s | proud | See? Nominal. |
| CH02_SC03-05 | 16:11.0 | 2.6 s | panic | That is outside the schedule! |
| CH02_SC03-06 | 16:22.0 | 1.4 s | panic | Wait for me! |
| CH02_SC03-09 | 17:02.8 | 2.4 s | sad | My route is here. My schedule… |
| CH02_SC03-10 | 17:10.8 | 3.0 s | soft | Courier rule one: deliver the visitor safely. |
| CH02_SC03-11 | 17:15.2 | 2.2 s | happy | …Wherever they are going. |
| CH02_SC03-14 | 17:33.3 | 1.2 s | stern | Hold on. |
| CH03_SC01-02 | 18:10.4 | 2.4 s | stern | This is not on any map. |
| CH03_SC01-03 | 18:22.0 | 2.2 s | panic | Wait! Rule four: stay on the platform! |
| CH03_SC01-08 | 19:28.7 | 2.4 s | stern | Please. Return. To the platform. |
| CH03_SC01-11 | 20:10.0 | 2.0 s | panic | That one is coming closer. |
| CH03_SC01-12 | 20:28.2 | 2.6 s | stern | Do not. Touch. The planet. |
| CH03_SC02-01 | 20:41.2 | 1.6 s | panic | This is a bad idea! |
| CH03_SC02-04 | 21:00.2 | 2.0 s | soft | Impossible. Unscheduled. Beautiful. |
| CH03_SC02-06 | 21:57.3 | 2.4 s | stern | We are chasing an insect now? |
| CH03_INS1-01 | 22:16.1 | 1.2 s | playful | Race you. |
| CH03_INS1-03 | 22:30.1 | 1.4 s | playful | See you at the finish! |
| CH03_INS1-06 | 22:41.7 | 2.6 s | proud | Courier rule three: know the shortcuts. |
| CH03_SC02-08 | 23:05.3 | 2.0 s | curious | Is that… a tiny one? |
| CH03_SC02-10 | 23:35.4 | 2.0 s | soft | My processors hurt. |
| CH03_SC02-12 | 24:07.4 | 3.0 s | soft | Courier log: today, we went inside a planet. |
| CH03_SC03-01 | 24:35.0 | 1.4 s | curious | Who is that? |
| CH03_SC03-03 | 25:15.0 | 2.8 s | worried | That thread… it just went out. |
| CH03_SC03-05 | 25:59.0 | 2.2 s | soft | Courier rule one? |
| CH03_SC03-07 | 26:05.4 | 2.0 s | happy | …Wherever they go. |
| CH04_SC01-02 | 26:52.4 | 2.0 s | stern | Too bright. Too loud. |
| CH04_SC01-03 | 27:01.4 | 2.4 s | stern | Stay close. Cities eat small drones. |
| CH04_SC01-06 | 28:04.2 | 2.6 s | stern | Unstable grid. Do not touch anything. |
| CH04_SC01-09 | 28:34.2 | 3.0 s | soft | The east district has power to spare. The west has none. |
| CH04_SC01-11 | 28:44.2 | 1.6 s | worried | Oh no. |
| CH04_SC01-13 | 29:14.4 | 2.4 s | stern | How many is a few? |
| CH04_SC02-01 | 29:50.6 | 1.6 s | curious | What does it do? |
| CH04_SC02-04 | 30:36.1 | 1.6 s | worried | Is it supposed to do that? |
| CH04_SC02-06 | 31:06.5 | 3.6 s | soft | Courier rule twelve: the simplest route is usually the right one. |
| CH04_INS1-01 | 31:44.4 | 2.0 s | panic | Wardens! They want the power! |
| CH04_INS1-04 | 32:02.2 | 0.8 s | panic | Now what?! |
| CH04_INS1-07 | 32:11.3 | 1.4 s | stern | You planned that? |
| CH04_SC02-08 | 32:23.9 | 1.6 s | panic | Almost! Almost! |
| CH04_SC02-10 | 32:43.9 | 1.4 s | proud | Efficient. |
| CH04_SC03-01 | 33:22.0 | 2.0 s | worried | The far district… it’s fading. |
| CH04_SC03-03 | 33:36.0 | 1.8 s | worried | Something up there is drinking it. |
| CH04_SC03-06 | 33:46.4 | 1.6 s | curious | Who is she? |
| CH04_SC03-08 | 33:60.0 | 1.6 s | panic | Wait for me! |
| CH04_SC03-09 | 34:40.9 | 2.2 s | soft | Next stop: unscheduled. |
| CH05_SC01-02 | 35:35.1 | 2.2 s | happy | Finally. Somewhere quiet. |
| CH05_SC01-05 | 36:45.4 | 2.4 s | worried | Parts of it are going dark. |
| CH05_SC01-07 | 37:38.0 | 2.4 s | soft | It is too far from the others. |
| CH05_SC02-02 | 38:19.5 | 2.0 s | stern | You startled it. |
| CH05_SC02-04 | 38:45.7 | 3.0 s | soft | Courier rule… I do not have a rule for this. |
| CH05_SC02-07 | 40:38.0 | 1.8 s | curious | So what do we do? |
| CH05_SC03-01 | 42:24.8 | 1.6 s | soft | You waited. |
| CH05_INS1-01 | 42:52.4 | 1.6 s | worried | That is… large. |
| CH05_INS1-04 | 43:03.4 | 2.2 s | panic | I am not rated for submersion! |
| CH05_INS1-06 | 43:23.0 | 1.4 s | panic | Wardens! |
| CH05_SC03-04 | 44:17.7 | 2.4 s | worried | And it is failing everywhere. |
| CH06_SC01-02 | 45:11.7 | 2.0 s | worried | My map has no edges. |
| CH06_SC01-05 | 46:05.2 | 1.6 s | soft | Hello, home. |
| CH06_SC01-07 | 46:56.8 | 2.0 s | worried | Threads are snapping. |
| CH06_SC02-04 | 48:15.5 | 2.0 s | curious | Is she… on the schedule? |
| CH06_SC02-12 | 49:54.8 | 1.4 s | proud | Efficient. |
| CH06_INS1-01 | 50:04.4 | 1.0 s | panic | Company! |
| CH06_INS1-03 | 50:16.8 | 1.6 s | panic | They are gaining! |
| CH06_INS1-05 | 50:30.8 | 1.6 s | surprised | They… missed? |
| CH06_SC03-02 | 52:21.1 | 2.4 s | worried | The map is getting weaker. |
| CH06_SC03-03 | 53:04.4 | 2.4 s | sad | This is the end of my map. |
| CH06_SC03-05 | 53:15.4 | 1.4 s | proud | Courier rule one. |
| CH07_SC01-02 | 54:26.6 | 2.0 s | worried | Off every map. |
| CH07_SC01-04 | 55:09.6 | 1.2 s | panic | Too close! |
| CH07_INS1-03 | 55:36.6 | 1.6 s | determined | Courier rule one! |
| CH07_INS1-05 | 55:54.0 | 2.0 s | proud | Rule one. Always. |
| CH07_SC01-06 | 56:46.5 | 2.0 s | panic | Their threads are snapping! |
| CH07_SC02-01 | 58:05.1 | 1.8 s | panic | ARCHIVE, you can’t hold both! |
| CH07_SC02-03 | 58:20.5 | 1.6 s | determined | I’ll take that one! |
| CH07_SC02-05 | 58:32.5 | 2.6 s | determined | Courier rule one: deliver the visitor safely! |
| CH07_SC02-06 | 58:49.8 | 1.0 s | panic | ARCHIVE—! |
| CH09_SC01-05 | 73:10.9 | 3.0 s | determined | Courier rule one: deliver… the signal! |
| CH09_SC01-07 | 73:26.9 | 3.2 s | happy | I followed Verdance’s signal. It wanted to help. |
| CH09_SC01-09 | 73:35.5 | 2.6 s | proud | You are my visitor. I deliver. |
| CH09_INS1-02 | 74:23.9 | 1.6 s | panic | That is Magnus! |
| CH09_INS1-06 | 74:46.5 | 1.0 s | awe | Whoa. |
| CH09_INS1-12 | 75:29.5 | 2.0 s | happy | Courier log: the big one is nice now. |
| CH09_SC02-01 | 76:01.0 | 1.6 s | excited | Ferrum’s on the line! |
| CH09_SC02-02 | 76:10.0 | 1.8 s | excited | Thalassa too! |
| CH09_SC02-05 | 77:45.7 | 1.6 s | proud | Nominal. |
| CH09_SC03-05 | 79:14.5 | 2.4 s | proud | Visitor… delivered. |
| CH09_SC03-08 | 80:04.8 | 1.8 s | proud | The best courier. |
| CH10_SC01-03 | 81:54.1 | 1.8 s | proud | Still shared. Efficient. |
| CH10_SC01-05 | 82:32.6 | 1.4 s | playful | Show-offs. |
| CH10_SC01-07 | 83:01.2 | 2.2 s | happy | Home. On schedule, for once. |
| CH10_SC01-09 | 83:27.1 | 2.6 s | soft | It never stopped. Not since you touched it. |
| CH10_SC01-10 | 83:45.1 | 3.0 s | proud | Courier log: the visitor saved every world. |
| CH10_SC01-12 | 83:53.7 | 1.6 s | playful | A lot of help. |
| CH10_SC02-08 | 85:10.0 | 2.4 s | soft | Courier rule one applies to you too. |
| CH10_SC02-10 | 85:16.4 | 1.8 s | proud | Wherever they go. |
| CH10_SC02-12 | 85:58.5 | 2.2 s | curious | So. Where next? |
| CH10_SC03-01 | 87:42.0 | 2.0 s | curious | That one’s not on any map. |

## ALICIA (33 lines)

| ID | Time | Length | Emotion | Line |
|---|---|---|---|---|
| CH04_SC03-04 | 33:39.4 | 2.6 s | faint | …hold… on… |
| CH06_SC02-01 | 48:00.7 | 2.6 s | warm | You came. I hoped you would. |
| CH06_SC02-03 | 48:10.3 | 3.2 s | warm | I am the Loom’s keeper. Its mind, if you like. |
| CH06_SC02-05 | 48:22.1 | 4.6 s | sad | The threads pull one way now, toward the Core. The worlds take, and nothing comes back. |
| CH06_SC02-06 | 48:51.0 | 4.0 s | serious | Here. The Cosmic Core. Everything flows there now. |
| CH06_SC02-08 | 49:02.6 | 3.8 s | faint | It’s far. And I can’t hold this form for long. |
| CH06_SC02-10 | 49:13.6 | 2.0 s | warm | …Follow the map. |
| CH06_SC02-13 | 51:05.8 | 3.2 s | faint | …the threads ahead are breaking. Be careful… |
| CH07_SC03-03 | 61:15.8 | 3.0 s | faint | …ARCHIVE… the Core… it’s close… |
| CH08_SC01-06 | 65:48.5 | 2.6 s | soft | You made it. Alone? |
| CH08_SC01-08 | 65:57.5 | 3.2 s | sad | I’m sorry. I know what it is to lose someone to the dark. |
| CH08_SC02-01 | 66:13.4 | 3.0 s | soft | Let me show you who you were. |
| CH08_SC02-02 | 66:24.4 | 3.6 s | warm | You were the conductor. You kept every world in time. |
| CH08_SC02-03 | 66:46.9 | 3.6 s | sad | Then the energy ran low. Everything was failing at once. |
| CH08_SC02-04 | 66:54.9 | 3.4 s | sad | I powered you down to save them. I thought I could hold it alone. |
| CH08_SC02-05 | 67:06.9 | 3.6 s | faint | I held it for as long as I could. Every year, a little less of me. |
| CH08_SC02-06 | 67:20.4 | 4.0 s | sad | It was never meant to be held by one. Not by you. Not by me. |
| CH08_SC02-08 | 67:29.4 | 2.6 s | faint | And I’m almost out of time. |
| CH08_SC03-01 | 69:00.4 | 4.0 s | serious | The Seat links a conductor to the Heartstar. It could hold the rhythm again. |
| CH08_SC03-02 | 69:05.4 | 3.6 s | sad | But if you take it… you may never leave it. |
| CH08_SC03-07 | 69:51.6 | 2.0 s | sad | ARCHIVE… |
| CH09_SC01-02 | 72:26.8 | 2.6 s | faint | It’s too much for one— |
| CH09_SC01-11 | 74:04.5 | 3.0 s | hopeful | It’s a share. The worlds can carry a share. |
| CH09_SC02-06 | 78:01.4 | 3.4 s | warm | ARCHIVE… the Seat doesn’t need you anymore. Not alone. |
| CH09_SC03-01 | 78:52.5 | 3.0 s | warm | I’m… not fading. For the first time in so long. |
| CH09_SC03-03 | 79:07.5 | 2.8 s | warm | You did it. You all did. |
| CH09_SC03-06 | 79:55.4 | 3.4 s | warm | There are still worlds that went dark. They’ll need visiting. |
| CH10_SC02-01 | 84:29.0 | 3.0 s | warm | I wanted to see one of them. With my own eyes. |
| CH10_SC02-03 | 84:36.0 | 2.4 s | warm | It is. Because it’s connected. |
| CH10_SC02-04 | 84:45.0 | 3.4 s | warm | I belong in the Loom. Every thread is mine to keep now. But not alone. |
| CH10_SC02-06 | 84:53.0 | 3.2 s | warm | Every time you open a door, I’ll be on the other side of it. |
| CH10_SC02-07 | 85:03.0 | 2.6 s | warm | Something to remember me by. |
| CH10_SC02-09 | 85:13.4 | 2.4 s | warm | …Deliver the visitor safely? |

## CITY (3 lines)

| ID | Time | Length | Emotion | Line |
|---|---|---|---|---|
| CH04_SC01-05 | 27:42.2 | 3.2 s | neutral | Load exceeded. District West offline. |
| CH04_SC02-05 | 30:51.5 | 2.6 s | neutral | Load exceeded. District East unstable. |
| CH04_SC02-09 | 32:39.9 | 2.6 s | neutral | Load balanced. All districts nominal. |

## WARDEN (1 lines)

| ID | Time | Length | Emotion | Line |
|---|---|---|---|---|
| CH01_INS1-02 | 7:20.2 | 1.2 s | cold | INTRUDER. |

## MAGNUS (4 lines)

| ID | Time | Length | Emotion | Line |
|---|---|---|---|---|
| CH09_INS1-01 | 74:20.9 | 2.6 s | cold | The light… is MINE. |
| CH09_INS1-08 | 74:57.5 | 1.6 s | cold | You cannot— |
| CH09_INS1-09 | 75:15.5 | 3.0 s | soft | …I was afraid… of the dark. |
| CH09_INS1-11 | 75:22.5 | 1.6 s | warm | …Together. |

## Full script in film order

| Time | Character | Line | ID |
|---|---|---|---|
| 0:01.0 | NARRATOR | Long ago, every world was connected by a network of light called the Loom. Its rhythm kept them all in time. | NARR-01 |
| 0:12.9 | ARCHIVE | …hello? | CH01_SC01-01 |
| 0:14.5 | NARRATOR | But the rhythm was failing. And deep in a forgotten Archive, the one who once kept it… was waking up. | NARR-02 |
| 0:38.0 | ARCHIVE | Whoa. | CH01_SC03-01 |
| 1:01.6 | ARCHIVE | Eep! | CH01_SC04-01 |
| 1:08.7 | ARCHIVE | Heh. That’s me. | CH01_SC04-02 |
| 1:10.7 | NARRATOR | The tiny world was a map. It showed the four shards of the Keystone — the only thing that could restart the Loom’s heart. | NARR-03 |
| 1:26.4 | ARCHIVE | What are you? | CH01_SC05-01 |
| 1:35.7 | ARCHIVE | …oops. | CH01_SC05-02 |
| 2:17.5 | ARCHIVE | Whoa… | CH01_SC07-01 |
| 2:42.5 | ARCHIVE | They’re all… connected. | CH01_SC07-02 |
| 2:50.5 | ARCHIVE | No— | CH01_SC07-03 |
| 3:14.2 | ARCHIVE | Where are you going? | CH01_SC07-04 |
| 4:08.5 | ARCHIVE | Ha! | CH01_SC08-01 |
| 4:48.2 | ARCHIVE | Huh? | CH01_SC08-02 |
| 5:16.0 | ARCHIVE | …A door? | CH01_SC08-03 |
| 6:12.0 | ARCHIVE | If I go… | CH01_SC09-01 |
| 6:29.4 | ARCHIVE | Okay. I’ll come back. | CH01_SC09-02 |
| 6:42.0 | ARCHIVE | Bye! | CH01_SC09-03 |
| 7:07.0 | ARCHIVE | Okay. Let’s go see. | CH01_SC09-04 |
| 7:18.6 | ARCHIVE | Uh… hello? | CH01_INS1-01 |
| 7:20.2 | WARDEN | INTRUDER. | CH01_INS1-02 |
| 7:24.0 | ARCHIVE | Nope! Nope! | CH01_INS1-03 |
| 7:44.4 | ARCHIVE | Sorry! | CH01_INS1-04 |
| 7:52.0 | ARCHIVE | It’s not angry… it’s out of power. | CH01_INS1-05 |
| 8:00.0 | ARCHIVE | I’ll come back for you too. | CH01_INS1-06 |
| 8:37.9 | ARCHIVE | Wheeee! | CH01_SC09-05 |
| 9:10.1 | NARRATOR | The first shard was hidden in Verdance, the First World — a city that gives back everything it takes. | NARR-04 |
| 9:20.1 | ARCHIVE | Whoa… | CH02_SC01-01 |
| 10:04.3 | ARCHIVE | Hi! | CH02_SC01-02 |
| 10:35.3 | ARCHIVE | Again! | CH02_SC01-03 |
| 10:54.7 | TOCK | Unregistered unit! State your purpose. | CH02_SC01-04 |
| 10:57.9 | ARCHIVE | Um… exploring? | CH02_SC01-05 |
| 11:00.3 | TOCK | Exploring is not on the schedule. | CH02_SC01-06 |
| 11:15.7 | TOCK | …Fine. Courier rule seven: escort all visitors. | CH02_SC01-07 |
| 11:19.7 | ARCHIVE | Yes! | CH02_SC01-08 |
| 11:22.7 | TOCK | Follow me. Stay in the lane. | CH02_SC01-09 |
| 11:46.0 | ARCHIVE | It’s… a whole world. | CH02_SC01-10 |
| 12:13.4 | TOCK | This is the Fountain Plaza. Do not touch the fountain. | CH02_SC02-01 |
| 12:30.1 | TOCK | Stop! Stop! | CH02_SC02-02 |
| 12:41.8 | TOCK | Rule one. Do. Not. Touch. | CH02_SC02-03 |
| 12:45.8 | ARCHIVE | Sorry… | CH02_SC02-04 |
| 12:52.0 | TOCK | …The fountain has never played music before. | CH02_SC02-05 |
| 12:56.0 | ARCHIVE | A shard! | CH02_SC02-06 |
| 13:02.8 | TOCK | Faster on the tram. Come. | CH02_SC02-07 |
| 13:16.6 | ARCHIVE | Wheee! | CH02_SC02-08 |
| 13:29.6 | TOCK | Every tower grows food. Every canal cools the city. Everything gives back. | CH02_SC02-09 |
| 13:53.8 | TOCK | Rule nine: do not ride on the roof. | CH02_INS1-01 |
| 13:56.2 | ARCHIVE | Just once! | CH02_INS1-02 |
| 14:01.8 | ARCHIVE | Wheeeee! | CH02_INS1-03 |
| 14:05.8 | TOCK | It is speeding up! | CH02_INS1-04 |
| 14:07.8 | ARCHIVE | Is that bad? | CH02_INS1-05 |
| 14:09.0 | TOCK | BRAKES! | CH02_INS1-06 |
| 14:13.6 | ARCHIVE | …Ow. | CH02_INS1-07 |
| 14:15.8 | TOCK | Rule nine. | CH02_INS1-08 |
| 14:17.8 | ARCHIVE | Worth it. | CH02_INS1-09 |
| 14:41.6 | TOCK | That symbol… it’s on the old gate. At the edge of the city. | CH02_SC02-10 |
| 15:37.0 | TOCK | Minor fluctuation. Within tolerance. | CH02_SC03-01 |
| 15:40.6 | ARCHIVE | Three pulses. Just like home. | CH02_SC03-02 |
| 15:43.8 | TOCK | Home? | CH02_SC03-03 |
| 15:52.2 | TOCK | See? Nominal. | CH02_SC03-04 |
| 16:11.0 | TOCK | That is outside the schedule! | CH02_SC03-05 |
| 16:22.0 | TOCK | Wait for me! | CH02_SC03-06 |
| 16:51.8 | ARCHIVE | There are more worlds… | CH02_SC03-07 |
| 16:58.2 | ARCHIVE | Come with me? | CH02_SC03-08 |
| 17:02.8 | TOCK | My route is here. My schedule… | CH02_SC03-09 |
| 17:10.8 | TOCK | Courier rule one: deliver the visitor safely. | CH02_SC03-10 |
| 17:15.2 | TOCK | …Wherever they are going. | CH02_SC03-11 |
| 17:18.2 | ARCHIVE | Yes! | CH02_SC03-12 |
| 17:30.9 | ARCHIVE | Okay, Tock. Let’s go see. | CH02_SC03-13 |
| 17:33.3 | TOCK | Hold on. | CH02_SC03-14 |
| 18:01.0 | NARRATOR | Between the worlds turns the Orrery, where every world holds another world inside it. | NARR-05 |
| 18:08.0 | ARCHIVE | Whoa… | CH03_SC01-01 |
| 18:10.4 | TOCK | This is not on any map. | CH03_SC01-02 |
| 18:22.0 | TOCK | Wait! Rule four: stay on the platform! | CH03_SC01-03 |
| 18:28.6 | ARCHIVE | Ooh… an ocean! | CH03_SC01-04 |
| 18:42.6 | ARCHIVE | It’s so… sandy. | CH03_SC01-05 |
| 18:57.6 | ARCHIVE | Floating islands! | CH03_SC01-06 |
| 19:13.9 | ARCHIVE | Whoa, shiny. | CH03_SC01-07 |
| 19:28.7 | TOCK | Please. Return. To the platform. | CH03_SC01-08 |
| 19:29.3 | ARCHIVE | Someone lives here. | CH03_SC01-09 |
| 19:48.2 | ARCHIVE | They’re connected. Like at home. | CH03_SC01-10 |
| 20:10.0 | TOCK | That one is coming closer. | CH03_SC01-11 |
| 20:28.2 | TOCK | Do not. Touch. The planet. | CH03_SC01-12 |
| 20:31.6 | ARCHIVE | Watch this. | CH03_SC01-13 |
| 20:41.2 | TOCK | This is a bad idea! | CH03_SC02-01 |
| 20:46.2 | ARCHIVE | Let’s go in! | CH03_SC02-02 |
| 20:57.2 | ARCHIVE | We’re inside it! | CH03_SC02-03 |
| 21:00.2 | TOCK | Impossible. Unscheduled. Beautiful. | CH03_SC02-04 |
| 21:46.3 | ARCHIVE | Oh! | CH03_SC02-05 |
| 21:57.3 | TOCK | We are chasing an insect now? | CH03_SC02-06 |
| 22:12.3 | ARCHIVE | It likes me! | CH03_SC02-07 |
| 22:16.1 | TOCK | Race you. | CH03_INS1-01 |
| 22:17.3 | ARCHIVE | You’re on! | CH03_INS1-02 |
| 22:30.1 | TOCK | See you at the finish! | CH03_INS1-03 |
| 22:32.3 | ARCHIVE | Hey! | CH03_INS1-04 |
| 22:40.3 | ARCHIVE | That’s cheating! | CH03_INS1-05 |
| 22:41.7 | TOCK | Courier rule three: know the shortcuts. | CH03_INS1-06 |
| 23:05.3 | TOCK | Is that… a tiny one? | CH03_SC02-08 |
| 23:10.9 | ARCHIVE | A world. Inside a world. | CH03_SC02-09 |
| 23:35.4 | TOCK | My processors hurt. | CH03_SC02-10 |
| 23:39.4 | ARCHIVE | Worlds… inside worlds… inside worlds! | CH03_SC02-11 |
| 24:07.4 | TOCK | Courier log: today, we went inside a planet. | CH03_SC02-12 |
| 24:13.4 | ARCHIVE | Best day ever. | CH03_SC02-13 |
| 24:35.0 | TOCK | Who is that? | CH03_SC03-01 |
| 24:49.0 | ARCHIVE | Wait—who are you? | CH03_SC03-02 |
| 25:15.0 | TOCK | That thread… it just went out. | CH03_SC03-03 |
| 25:56.4 | ARCHIVE | Red. Hm. | CH03_SC03-04 |
| 25:59.0 | TOCK | Courier rule one? | CH03_SC03-05 |
| 26:02.0 | ARCHIVE | Deliver the visitor safely. | CH03_SC03-06 |
| 26:05.4 | TOCK | …Wherever they go. | CH03_SC03-07 |
| 26:42.4 | NARRATOR | The second shard lay in Ferrum, a city of power… and of hunger. Someone was draining its light. | NARR-06 |
| 26:50.0 | ARCHIVE | Whoa… | CH04_SC01-01 |
| 26:52.4 | TOCK | Too bright. Too loud. | CH04_SC01-02 |
| 27:01.4 | TOCK | Stay close. Cities eat small drones. | CH04_SC01-03 |
| 27:04.4 | ARCHIVE | Not this one! | CH04_SC01-04 |
| 27:42.2 | CITY | Load exceeded. District West offline. | CH04_SC01-05 |
| 28:04.2 | TOCK | Unstable grid. Do not touch anything. | CH04_SC01-06 |
| 28:09.2 | ARCHIVE | We have to help. | CH04_SC01-07 |
| 28:24.2 | ARCHIVE | Too much here… nothing there. | CH04_SC01-08 |
| 28:34.2 | TOCK | The east district has power to spare. The west has none. | CH04_SC01-09 |
| 28:41.8 | ARCHIVE | I know! | CH04_SC01-10 |
| 28:44.2 | TOCK | Oh no. | CH04_SC01-11 |
| 29:08.4 | ARCHIVE | It needs… a few parts. | CH04_SC01-12 |
| 29:14.4 | TOCK | How many is a few? | CH04_SC01-13 |
| 29:18.0 | ARCHIVE | Lots. | CH04_SC01-14 |
| 29:50.6 | TOCK | What does it do? | CH04_SC02-01 |
| 29:54.2 | ARCHIVE | It… helps! | CH04_SC02-02 |
| 30:19.6 | ARCHIVE | Yes! | CH04_SC02-03 |
| 30:36.1 | TOCK | Is it supposed to do that? | CH04_SC02-04 |
| 30:51.5 | CITY | Load exceeded. District East unstable. | CH04_SC02-05 |
| 31:06.5 | TOCK | Courier rule twelve: the simplest route is usually the right one. | CH04_SC02-06 |
| 31:23.1 | ARCHIVE | Share it! | CH04_SC02-07 |
| 31:44.4 | TOCK | Wardens! They want the power! | CH04_INS1-01 |
| 31:47.5 | ARCHIVE | Then they’ll have to catch me! | CH04_INS1-02 |
| 32:00.5 | ARCHIVE | Tock—when I say now… | CH04_INS1-03 |
| 32:02.2 | TOCK | Now what?! | CH04_INS1-04 |
| 32:02.8 | ARCHIVE | NOW! | CH04_INS1-05 |
| 32:05.9 | ARCHIVE | Sorry! You’ll get your share. I promise. | CH04_INS1-06 |
| 32:11.3 | TOCK | You planned that? | CH04_INS1-07 |
| 32:13.1 | ARCHIVE | …Mostly. | CH04_INS1-08 |
| 32:23.9 | TOCK | Almost! Almost! | CH04_SC02-08 |
| 32:39.9 | CITY | Load balanced. All districts nominal. | CH04_SC02-09 |
| 32:43.9 | TOCK | Efficient. | CH04_SC02-10 |
| 32:46.5 | ARCHIVE | Simplest route. | CH04_SC02-11 |
| 33:22.0 | TOCK | The far district… it’s fading. | CH04_SC03-01 |
| 33:33.0 | ARCHIVE | It’s going… up. And it’s not coming back. | CH04_SC03-02 |
| 33:36.0 | TOCK | Something up there is drinking it. | CH04_SC03-03 |
| 33:39.4 | ALICIA | …hold… on… | CH04_SC03-04 |
| 33:44.0 | ARCHIVE | It’s her! | CH04_SC03-05 |
| 33:46.4 | TOCK | Who is she? | CH04_SC03-06 |
| 33:49.0 | ARCHIVE | I don’t know. But she needs help. | CH04_SC03-07 |
| 33:60.0 | TOCK | Wait for me! | CH04_SC03-08 |
| 34:40.9 | TOCK | Next stop: unscheduled. | CH04_SC03-09 |
| 34:44.5 | ARCHIVE | My favourite kind. | CH04_SC03-10 |
| 35:22.7 | NARRATOR | The third shard lay beneath Thalassa’s sea, guarded by a reef that remembered everything. | NARR-07 |
| 35:30.7 | ARCHIVE | Whoa… | CH05_SC01-01 |
| 35:35.1 | TOCK | Finally. Somewhere quiet. | CH05_SC01-02 |
| 35:41.7 | ARCHIVE | Gardens… in towers! | CH05_SC01-03 |
| 36:18.2 | ARCHIVE | It’s glowing! | CH05_SC01-04 |
| 36:45.4 | TOCK | Parts of it are going dark. | CH05_SC01-05 |
| 37:31.0 | ARCHIVE | Hey… are you okay? | CH05_SC01-06 |
| 37:38.0 | TOCK | It is too far from the others. | CH05_SC01-07 |
| 38:12.5 | ARCHIVE | Here. Take some light! | CH05_SC02-01 |
| 38:19.5 | TOCK | You startled it. | CH05_SC02-02 |
| 38:38.3 | ARCHIVE | No, no, no— | CH05_SC02-03 |
| 38:45.7 | TOCK | Courier rule… I do not have a rule for this. | CH05_SC02-04 |
| 40:12.0 | ARCHIVE | They’re… talking. In threes. | CH05_SC02-05 |
| 40:22.0 | ARCHIVE | And it’s too far away to hear them. | CH05_SC02-06 |
| 40:38.0 | TOCK | So what do we do? | CH05_SC02-07 |
| 40:46.0 | ARCHIVE | We wait. And we listen. | CH05_SC02-08 |
| 42:24.8 | TOCK | You waited. | CH05_SC03-01 |
| 42:27.8 | ARCHIVE | It didn’t need fixing. It needed someone to answer. | CH05_SC03-02 |
| 42:52.4 | TOCK | That is… large. | CH05_INS1-01 |
| 42:57.0 | ARCHIVE | Down there? | CH05_INS1-02 |
| 43:00.8 | ARCHIVE | Wheee—blub! | CH05_INS1-03 |
| 43:03.4 | TOCK | I am not rated for submersion! | CH05_INS1-04 |
| 43:21.0 | ARCHIVE | Three! | CH05_INS1-05 |
| 43:23.0 | TOCK | Wardens! | CH05_INS1-06 |
| 43:42.0 | ARCHIVE | Thank you! | CH05_INS1-07 |
| 44:08.7 | ARCHIVE | It’s everywhere… it’s all one network. | CH05_SC03-03 |
| 44:17.7 | TOCK | And it is failing everywhere. | CH05_SC03-04 |
| 44:22.7 | ARCHIVE | Then we go up. | CH05_SC03-05 |
| 44:58.3 | NARRATOR | With three shards, ARCHIVE could finally see the Loom itself — and the one hiding inside it. | NARR-08 |
| 45:06.3 | ARCHIVE | We’re inside the network… | CH06_SC01-01 |
| 45:11.7 | TOCK | My map has no edges. | CH06_SC01-02 |
| 45:43.8 | ARCHIVE | They’re all going the same way. | CH06_SC01-03 |
| 46:00.4 | ARCHIVE | Verdance! Hi! | CH06_SC01-04 |
| 46:05.2 | TOCK | Hello, home. | CH06_SC01-05 |
| 46:26.2 | ARCHIVE | The reef… Lumen’s okay. | CH06_SC01-06 |
| 46:56.8 | TOCK | Threads are snapping. | CH06_SC01-07 |
| 47:05.8 | ARCHIVE | It’s worse than Ferrum. Worse than Thalassa. | CH06_SC01-08 |
| 48:00.7 | ALICIA | You came. I hoped you would. | CH06_SC02-01 |
| 48:05.7 | ARCHIVE | You’re… her. From the panel. | CH06_SC02-02 |
| 48:10.3 | ALICIA | I am the Loom’s keeper. Its mind, if you like. | CH06_SC02-03 |
| 48:15.5 | TOCK | Is she… on the schedule? | CH06_SC02-04 |
| 48:22.1 | ALICIA | The threads pull one way now, toward the Core. The worlds take, and nothing comes back. | CH06_SC02-05 |
| 48:51.0 | ALICIA | Here. The Cosmic Core. Everything flows there now. | CH06_SC02-06 |
| 48:57.6 | ARCHIVE | Then that’s where we go. | CH06_SC02-07 |
| 49:02.6 | ALICIA | It’s far. And I can’t hold this form for long. | CH06_SC02-08 |
| 49:08.6 | ARCHIVE | Then hold on. We’re coming. | CH06_SC02-09 |
| 49:13.6 | ALICIA | …Follow the map. | CH06_SC02-10 |
| 49:50.8 | ARCHIVE | Ferrum! They kept it shared! | CH06_SC02-11 |
| 49:54.8 | TOCK | Efficient. | CH06_SC02-12 |
| 50:04.4 | TOCK | Company! | CH06_INS1-01 |
| 50:05.8 | ARCHIVE | Hold on—let’s catch a pulse! | CH06_INS1-02 |
| 50:16.8 | TOCK | They are gaining! | CH06_INS1-03 |
| 50:20.4 | ARCHIVE | Down we go! | CH06_INS1-04 |
| 50:30.8 | TOCK | They… missed? | CH06_INS1-05 |
| 50:32.8 | ARCHIVE | Pulses only go one way! | CH06_INS1-06 |
| 51:05.8 | ALICIA | …the threads ahead are breaking. Be careful… | CH06_SC02-13 |
| 51:41.2 | ARCHIVE | It’s… bigger than all the stars. | CH06_SC03-01 |
| 52:21.1 | TOCK | The map is getting weaker. | CH06_SC03-02 |
| 53:04.4 | TOCK | This is the end of my map. | CH06_SC03-03 |
| 53:10.4 | ARCHIVE | Then we draw a new one. | CH06_SC03-04 |
| 53:15.4 | TOCK | Courier rule one. | CH06_SC03-05 |
| 54:10.6 | NARRATOR | The last shard waited beyond every map, in the Lost Worlds, where the storm had already won. | NARR-09 |
| 54:22.6 | ARCHIVE | Where… are we? | CH07_SC01-01 |
| 54:26.6 | TOCK | Off every map. | CH07_SC01-02 |
| 54:35.6 | ARCHIVE | These were worlds. Pieces of worlds. | CH07_SC01-03 |
| 55:09.6 | TOCK | Too close! | CH07_SC01-04 |
| 55:32.6 | ARCHIVE | Wardens! | CH07_INS1-01 |
| 55:35.0 | ARCHIVE | Let go! Let GO! | CH07_INS1-02 |
| 55:36.6 | TOCK | Courier rule one! | CH07_INS1-03 |
| 55:51.6 | ARCHIVE | Thanks, partner. | CH07_INS1-04 |
| 55:54.0 | TOCK | Rule one. Always. | CH07_INS1-05 |
| 56:26.4 | ARCHIVE | They’re coming loose… both of them. | CH07_SC01-05 |
| 56:46.5 | TOCK | Their threads are snapping! | CH07_SC01-06 |
| 57:15.9 | ARCHIVE | Hold on. I’ve got you. | CH07_SC01-07 |
| 58:05.1 | TOCK | ARCHIVE, you can’t hold both! | CH07_SC02-01 |
| 58:10.1 | ARCHIVE | I have to—! | CH07_SC02-02 |
| 58:20.5 | TOCK | I’ll take that one! | CH07_SC02-03 |
| 58:30.1 | ARCHIVE | Tock! | CH07_SC02-04 |
| 58:32.5 | TOCK | Courier rule one: deliver the visitor safely! | CH07_SC02-05 |
| 58:49.8 | TOCK | ARCHIVE—! | CH07_SC02-06 |
| 58:52.2 | ARCHIVE | TOCK! | CH07_SC02-07 |
| 59:43.8 | ARCHIVE | I couldn’t hold them both. | CH07_SC02-08 |
| 60:19.9 | ARCHIVE | The last shard… thank you. | CH07_SC02-09 |
| 60:44.1 | ARCHIVE | You said rule one… | CH07_SC03-01 |
| 61:00.8 | ARCHIVE | I’ll find you. After I fix this. | CH07_SC03-02 |
| 61:15.8 | ALICIA | …ARCHIVE… the Core… it’s close… | CH07_SC03-03 |
| 63:22.0 | NARRATOR | At the Core waited Magnus, the oldest of the Wardens. Afraid of going dark, he had taken the light for himself. | NARR-10 |
| 63:33.0 | ARCHIVE | Whoa… | CH08_SC01-01 |
| 63:45.3 | ARCHIVE | Tock would have a rule for this. | CH08_SC01-02 |
| 64:26.3 | ARCHIVE | Everything flows in… and the panels are failing. | CH08_SC01-03 |
| 64:51.9 | ARCHIVE | Even the light bends here. | CH08_SC01-04 |
| 65:26.7 | ARCHIVE | That’s… my emblem. | CH08_SC01-05 |
| 65:48.5 | ALICIA | You made it. Alone? | CH08_SC01-06 |
| 65:53.1 | ARCHIVE | Tock… the storm took Tock. | CH08_SC01-07 |
| 65:57.5 | ALICIA | I’m sorry. I know what it is to lose someone to the dark. | CH08_SC01-08 |
| 66:13.4 | ALICIA | Let me show you who you were. | CH08_SC02-01 |
| 66:24.4 | ALICIA | You were the conductor. You kept every world in time. | CH08_SC02-02 |
| 66:46.9 | ALICIA | Then the energy ran low. Everything was failing at once. | CH08_SC02-03 |
| 66:54.9 | ALICIA | I powered you down to save them. I thought I could hold it alone. | CH08_SC02-04 |
| 67:06.9 | ALICIA | I held it for as long as I could. Every year, a little less of me. | CH08_SC02-05 |
| 67:20.4 | ALICIA | It was never meant to be held by one. Not by you. Not by me. | CH08_SC02-06 |
| 67:26.4 | ARCHIVE | You were holding it alone. All this time. | CH08_SC02-07 |
| 67:29.4 | ALICIA | And I’m almost out of time. | CH08_SC02-08 |
| 69:00.4 | ALICIA | The Seat links a conductor to the Heartstar. It could hold the rhythm again. | CH08_SC03-01 |
| 69:05.4 | ALICIA | But if you take it… you may never leave it. | CH08_SC03-02 |
| 69:15.4 | ARCHIVE | Verdance… Thalassa… Ferrum… | CH08_SC03-03 |
| 69:34.6 | ARCHIVE | Tock would say: deliver the visitor safely. | CH08_SC03-04 |
| 69:39.6 | ARCHIVE | All of them are my visitors. | CH08_SC03-05 |
| 69:47.6 | ARCHIVE | Then I’ll hold it. As long as it takes. | CH08_SC03-06 |
| 69:51.6 | ALICIA | ARCHIVE… | CH08_SC03-07 |
| 70:15.5 | ARCHIVE | I’m ready. | CH08_SC03-08 |
| 71:43.6 | NARRATOR | One robot could not hold the Loom. But no one was ever meant to. | NARR-11 |
| 71:56.6 | ARCHIVE | Hold… hold… | CH09_SC01-01 |
| 72:26.8 | ALICIA | It’s too much for one— | CH09_SC01-02 |
| 72:30.8 | ARCHIVE | I won’t let go. | CH09_SC01-03 |
| 72:49.1 | ARCHIVE | I can’t… hold it… alone… | CH09_SC01-04 |
| 73:10.9 | TOCK | Courier rule one: deliver… the signal! | CH09_SC01-05 |
| 73:15.9 | ARCHIVE | TOCK! | CH09_SC01-06 |
| 73:26.9 | TOCK | I followed Verdance’s signal. It wanted to help. | CH09_SC01-07 |
| 73:31.9 | ARCHIVE | You came back. | CH09_SC01-08 |
| 73:35.5 | TOCK | You are my visitor. I deliver. | CH09_SC01-09 |
| 73:58.5 | ARCHIVE | Verdance… is holding with me! | CH09_SC01-10 |
| 74:04.5 | ALICIA | It’s a share. The worlds can carry a share. | CH09_SC01-11 |
| 74:10.5 | ARCHIVE | Then let’s ask them all. | CH09_SC01-12 |
| 74:20.9 | MAGNUS | The light… is MINE. | CH09_INS1-01 |
| 74:23.9 | TOCK | That is Magnus! | CH09_INS1-02 |
| 74:27.9 | ARCHIVE | Leave her alone! | CH09_INS1-03 |
| 74:33.5 | ARCHIVE | I can’t stop him alone… | CH09_INS1-04 |
| 74:38.1 | ARCHIVE | Verdance… Ferrum… Thalassa… everyone! | CH09_INS1-05 |
| 74:46.5 | TOCK | Whoa. | CH09_INS1-06 |
| 74:47.9 | ARCHIVE | Together! | CH09_INS1-07 |
| 74:57.5 | MAGNUS | You cannot— | CH09_INS1-08 |
| 75:15.5 | MAGNUS | …I was afraid… of the dark. | CH09_INS1-09 |
| 75:19.1 | ARCHIVE | You don’t have to hold it alone. | CH09_INS1-10 |
| 75:22.5 | MAGNUS | …Together. | CH09_INS1-11 |
| 75:29.5 | TOCK | Courier log: the big one is nice now. | CH09_INS1-12 |
| 76:01.0 | TOCK | Ferrum’s on the line! | CH09_SC02-01 |
| 76:10.0 | TOCK | Thalassa too! | CH09_SC02-02 |
| 76:19.0 | ARCHIVE | We’re holding it… together! | CH09_SC02-03 |
| 77:37.7 | ARCHIVE | Every world… in time. | CH09_SC02-04 |
| 77:45.7 | TOCK | Nominal. | CH09_SC02-05 |
| 78:01.4 | ALICIA | ARCHIVE… the Seat doesn’t need you anymore. Not alone. | CH09_SC02-06 |
| 78:22.4 | ARCHIVE | I’m free! | CH09_SC02-07 |
| 78:52.5 | ALICIA | I’m… not fading. For the first time in so long. | CH09_SC03-01 |
| 78:56.5 | ARCHIVE | Because you’re not holding it alone. | CH09_SC03-02 |
| 79:07.5 | ALICIA | You did it. You all did. | CH09_SC03-03 |
| 79:11.5 | ARCHIVE | We did. | CH09_SC03-04 |
| 79:14.5 | TOCK | Visitor… delivered. | CH09_SC03-05 |
| 79:55.4 | ALICIA | There are still worlds that went dark. They’ll need visiting. | CH09_SC03-06 |
| 80:00.4 | ARCHIVE | I know a good courier. | CH09_SC03-07 |
| 80:04.8 | TOCK | The best courier. | CH09_SC03-08 |
| 81:20.1 | NARRATOR | And so the worlds were connected again — not by one heart, but by all of them. | NARR-12 |
| 81:29.5 | ARCHIVE | Hi, train! | CH10_SC01-01 |
| 81:39.1 | ARCHIVE | The far district’s bright again. | CH10_SC01-02 |
| 81:54.1 | TOCK | Still shared. Efficient. | CH10_SC01-03 |
| 82:29.2 | ARCHIVE | Hi, Lumen. | CH10_SC01-04 |
| 82:32.6 | TOCK | Show-offs. | CH10_SC01-05 |
| 82:54.2 | ARCHIVE | The trams are running! | CH10_SC01-06 |
| 83:01.2 | TOCK | Home. On schedule, for once. | CH10_SC01-07 |
| 83:21.1 | ARCHIVE | It’s playing music again. | CH10_SC01-08 |
| 83:27.1 | TOCK | It never stopped. Not since you touched it. | CH10_SC01-09 |
| 83:45.1 | TOCK | Courier log: the visitor saved every world. | CH10_SC01-10 |
| 83:49.7 | ARCHIVE | With a little help. | CH10_SC01-11 |
| 83:53.7 | TOCK | A lot of help. | CH10_SC01-12 |
| 84:29.0 | ALICIA | I wanted to see one of them. With my own eyes. | CH10_SC02-01 |
| 84:33.0 | ARCHIVE | It’s beautiful, right? | CH10_SC02-02 |
| 84:36.0 | ALICIA | It is. Because it’s connected. | CH10_SC02-03 |
| 84:45.0 | ALICIA | I belong in the Loom. Every thread is mine to keep now. But not alone. | CH10_SC02-04 |
| 84:50.0 | ARCHIVE | Will I see you again? | CH10_SC02-05 |
| 84:53.0 | ALICIA | Every time you open a door, I’ll be on the other side of it. | CH10_SC02-06 |
| 85:03.0 | ALICIA | Something to remember me by. | CH10_SC02-07 |
| 85:10.0 | TOCK | Courier rule one applies to you too. | CH10_SC02-08 |
| 85:13.4 | ALICIA | …Deliver the visitor safely? | CH10_SC02-09 |
| 85:16.4 | TOCK | Wherever they go. | CH10_SC02-10 |
| 85:36.9 | ARCHIVE | Bye, Alicia. | CH10_SC02-11 |
| 85:58.5 | TOCK | So. Where next? | CH10_SC02-12 |
| 86:08.5 | ARCHIVE | Somewhere… nobody’s been yet. | CH10_SC02-13 |
| 87:42.0 | TOCK | That one’s not on any map. | CH10_SC03-01 |
| 87:46.0 | ARCHIVE | Then let’s go see. | CH10_SC03-02 |
| 88:13.0 | NARRATOR | Every world is connected. And every door… is a new beginning. | NARR-13 |
