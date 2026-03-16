/**
 * Real-life inspired college football press conference question patterns.
 * Used as few-shot examples to train the AI generator for more authentic questions.
 *
 * Inspired by coaching archetypes: Saban (process coachspeak), Leach (eccentric deflections),
 * Spurrier (sharp one-liners), Swinney (emotional motivation), Harbaugh (oddball intensity),
 * Kiffin (social media savvy), Sanders (bravado), Kirby Smart (controlled intensity).
 */

export interface PressQuestionPattern {
  id: number;
  category: string;
  question: string;
  tone: "friendly" | "neutral" | "hostile" | "gotcha";
  contextTags: string[];
  responses: {
    honest: string;
    deflect: string;
    coachspeak: string;
    fiery: string;
  };
}

export const PRESS_CONFERENCE_DB: PressQuestionPattern[] = [
  // ── POST-GAME WIN (BLOWOUT) ──
  {
    id: 1,
    category: "post_game_win_blowout",
    question: "Coach, you guys dominated from start to finish tonight. What was working so well on both sides of the ball?",
    tone: "friendly",
    contextTags: ["post_win", "blowout", "game_recap"],
    responses: {
      honest: "We executed the game plan about as well as you can. The offensive line was dominant, and defensively we were flying around. Credit to our guys for preparing all week.",
      deflect: "We just focused on doing our job. Every week is a new challenge, and we'll enjoy this one tonight and get back to work tomorrow.",
      coachspeak: "Our guys came out with great energy and great effort. We emphasize the process, and tonight the process showed up. But we've got a lot of ball left to play.",
      fiery: "That's what happens when you buy in. I told these guys all week if they do their job, nobody in the country can stop us. And they believed it.",
    },
  },
  {
    id: 2,
    category: "post_game_win_blowout",
    question: "You were up big at halftime. At what point did you know this one was over?",
    tone: "neutral",
    contextTags: ["post_win", "blowout", "game_recap"],
    responses: {
      honest: "Honestly, when we went up three scores in the first quarter, I felt like we had control. But you never take your foot off the gas.",
      deflect: "A game is never over until it's over. We've all seen crazy comebacks. I just wanted our guys to keep playing our brand of football.",
      coachspeak: "We don't think about the scoreboard. We think about execution. Our guys were locked in on every snap, and that's all I can ask.",
      fiery: "I don't ever think it's over. I've seen too much football. We play 60 minutes. Period.",
    },
  },
  {
    id: 3,
    category: "post_game_win_blowout",
    question: "Your starters were out by the third quarter. How important was it to get the backups some reps?",
    tone: "friendly",
    contextTags: ["post_win", "blowout", "depth", "player_development"],
    responses: {
      honest: "That's huge for us. Those guys work their tails off every day in practice, and getting them live game action is invaluable for our depth going forward.",
      deflect: "We always want to develop our roster. Every guy on this team contributes, whether it's in practice or in games.",
      coachspeak: "Depth wins championships. We talk about that all the time. Tonight, a lot of guys got meaningful snaps, and that makes us better as a program.",
      fiery: "Those kids earned it. They bust their butts every single day and nobody sees it. Tonight, people got to see what we see every day in practice.",
    },
  },

  // ── POST-GAME WIN (CLOSE) ──
  {
    id: 4,
    category: "post_game_win_close",
    question: "Coach, that was a nail-biter. How did you guys pull that one out at the end?",
    tone: "friendly",
    contextTags: ["post_win", "close_game", "comeback"],
    responses: {
      honest: "Honestly, they had us on the ropes. But this team has something special — they don't flinch. The fourth-quarter drive was as good as anything I've been a part of.",
      deflect: "Good teams find ways to win. That's what we did tonight. We'll look at the film and clean some things up, but a win is a win.",
      coachspeak: "Our guys showed tremendous character and resilience. We talk about finishing, and tonight they finished. I'm proud of the toughness in that locker room.",
      fiery: "You want to know how? Heart. That's how. Those guys in that locker room refused to lose. You can't coach that.",
    },
  },
  {
    id: 5,
    category: "post_game_win_close",
    question: "You guys didn't play your best tonight but still found a way. Is there concern about how sloppy things were?",
    tone: "neutral",
    contextTags: ["post_win", "close_game", "performance_concerns"],
    responses: {
      honest: "Absolutely. We had too many penalties, too many missed assignments. We can't play like that and expect to beat the teams on our schedule coming up. But wins are hard to come by in this league.",
      deflect: "Every game is hard in this conference. We won, and that's what matters. We'll correct the mistakes and move forward.",
      coachspeak: "There's always things to clean up on the tape. We're never satisfied. We'll get back in the building and work on getting better.",
      fiery: "Sloppy? We won the game. Show me a team that plays perfect for 60 minutes. I'll wait. We found a way to win a tough road game, and I'm not going to apologize for that.",
    },
  },

  // ── POST-GAME WIN (UPSET) ──
  {
    id: 6,
    category: "post_game_win_upset",
    question: "Nobody gave you guys a chance tonight. What does this win mean for your program?",
    tone: "friendly",
    contextTags: ["post_win", "upset", "program_building"],
    responses: {
      honest: "It's a statement. Our players heard all week that they didn't belong on the same field. That's fuel. I think this shows the country what we're building here.",
      deflect: "We don't pay attention to what people outside our building say. We knew what we were capable of. Tonight we just went out and played our game.",
      coachspeak: "Our guys prepared like it was any other game. We respect every opponent, but we also believe in ourselves. The result took care of itself.",
      fiery: "Nobody gave us a chance? Good. We don't need anybody's permission to win football games. Keep doubting us. See what happens.",
    },
  },
  {
    id: 7,
    category: "post_game_win_upset",
    question: "Your team was a double-digit underdog. Was there a moment where you felt the upset was really going to happen?",
    tone: "friendly",
    contextTags: ["post_win", "upset", "turning_point"],
    responses: {
      honest: "When we got that third-down stop right before halftime and then scored going into the break, I looked at our sideline and I could see it in their eyes. They believed.",
      deflect: "I don't think about it as an upset. We came in with a game plan and executed it. Doesn't matter what Vegas says.",
      coachspeak: "We just focus on one play at a time. We don't get caught up in the external noise. Our guys just kept playing, and they were rewarded for it.",
      fiery: "I knew it was going to happen when we got off the bus. Our guys had a look tonight. Sometimes you just know.",
    },
  },

  // ── POST-GAME LOSS (CLOSE) ──
  {
    id: 8,
    category: "post_game_loss_close",
    question: "Tough one tonight, Coach. How do you process a loss like this?",
    tone: "neutral",
    contextTags: ["post_loss", "close_game", "emotional"],
    responses: {
      honest: "It hurts. You put everything into a game like this and come up short — that stings. I hurt for those kids in the locker room. They gave everything they had.",
      deflect: "We'll look at the film, figure out where we came up short, and get back to work. That's all you can do.",
      coachspeak: "Football is a game of inches. Tonight, the inches didn't go our way. But I'm proud of the fight in our guys, and we'll learn from this.",
      fiery: "I'm not going to stand up here and make excuses. We had our chances and didn't capitalize. That's on me. I've got to coach better, and I will.",
    },
  },
  {
    id: 9,
    category: "post_game_loss_close",
    question: "That last play call on fourth down is going to be second-guessed. Walk us through your thinking there.",
    tone: "gotcha",
    contextTags: ["post_loss", "close_game", "play_calling", "second_guessing"],
    responses: {
      honest: "We liked the matchup on the outside. Their corner was playing off, and we thought we could get a quick out. We just didn't execute it cleanly.",
      deflect: "I'm not going to get into specific play calls right now. We'll evaluate everything on film and go from there.",
      coachspeak: "We had confidence in the play and confidence in our players. Sometimes it works, sometimes it doesn't. That's football.",
      fiery: "I'd call it again. I believe in my guys. If you want to second-guess from the press box, that's your job. My job is to put our players in position to win, and I did that.",
    },
  },

  // ── POST-GAME LOSS (BLOWOUT) ──
  {
    id: 10,
    category: "post_game_loss_blowout",
    question: "Coach, what happened out there tonight?",
    tone: "neutral",
    contextTags: ["post_loss", "blowout", "game_recap"],
    responses: {
      honest: "They beat us in every phase. We weren't physical enough up front, we turned the ball over, and they made us pay. It's as simple and as ugly as that.",
      deflect: "We got outplayed. That's a good football team over there, and they were better than us tonight. We'll get back to work.",
      coachspeak: "We've got to go back and look at the tape and figure out what went wrong. It starts with me. I've got to have our guys better prepared.",
      fiery: "I'm embarrassed. That's not who we are. That is not this program. I promise you, what you saw tonight will not happen again.",
    },
  },
  {
    id: 11,
    category: "post_game_loss_blowout",
    question: "Your defense gave up over 500 yards tonight. Is a staff change something you're considering?",
    tone: "hostile",
    contextTags: ["post_loss", "blowout", "staff_changes", "hot_seat"],
    responses: {
      honest: "I'm not going to address personnel decisions 30 minutes after a game. That's not fair to anyone. We'll evaluate everything internally like we always do.",
      deflect: "I'm not going to get into staffing questions right now. Right now, my focus is on the players in that locker room.",
      coachspeak: "We'll evaluate everything as a staff. That's something we do every week. I'm not going to make any knee-jerk reactions standing at this podium.",
      fiery: "That's not a question I'm going to dignify right now. My staff works 20-hour days for this program. We'll handle our business internally.",
    },
  },

  // ── POST-GAME LOSS (RIVALRY) ──
  {
    id: 12,
    category: "post_game_loss_rival",
    question: "You've now lost multiple straight to your rival. What do you say to the frustrated fanbase?",
    tone: "hostile",
    contextTags: ["post_loss", "rivalry", "fan_frustration", "hot_seat"],
    responses: {
      honest: "I understand the frustration. Believe me, nobody is more frustrated than me. This game means everything to our program, and we haven't gotten it done. That's unacceptable.",
      deflect: "I feel for our fans. They deserve better, and we're going to work to give them better. That's all I can say right now.",
      coachspeak: "We share the frustration. This rivalry is what makes college football special, and we have to find a way to get over the hump. We will.",
      fiery: "I don't need anyone to tell me what this game means. I live it every single day. We're going to get this right. Mark it down.",
    },
  },
  {
    id: 13,
    category: "post_game_loss_rival",
    question: "Their coach had some things to say about your program after the game. Any response?",
    tone: "gotcha",
    contextTags: ["post_loss", "rivalry", "trash_talk"],
    responses: {
      honest: "I haven't heard what he said, and honestly, I don't care. My focus is on my team and what we need to do better.",
      deflect: "I'm not going to comment on what someone else said. I've got enough to worry about with my own program.",
      coachspeak: "I have a lot of respect for their program. I'm focused on what we do, not what anybody else says.",
      fiery: "He can say whatever he wants. Scoreboard talks right now, I get that. But we'll see them again. We always do.",
    },
  },

  // ── HOT SEAT / JOB SECURITY ──
  {
    id: 14,
    category: "hostile_hot_seat",
    question: "There's speculation about your job security. How do you address that with your players?",
    tone: "hostile",
    contextTags: ["hot_seat", "job_security", "media_speculation"],
    responses: {
      honest: "I'm not naive — I know how this business works. All I can do is coach my tail off every day and try to develop these young men. The results will speak for themselves.",
      deflect: "I don't deal in speculation. I deal in preparation. I've got a football team to coach, and that's what I'm going to do.",
      coachspeak: "My focus is on these players and this program. I can't control the outside noise. I control what I can control.",
      fiery: "Speculation? By who? People on the internet who've never coached a snap of football in their life? I've been in this business a long time. I'll be just fine.",
    },
  },
  {
    id: 15,
    category: "hostile_hot_seat",
    question: "Are you worried about job security after this loss?",
    tone: "hostile",
    contextTags: ["hot_seat", "job_security", "post_loss"],
    responses: {
      honest: "I don't worry about things I can't control. I worry about coaching this football team and developing these young men.",
      deflect: "I'm focused on getting this team better. That's all I have time to think about.",
      coachspeak: "My focus is and always has been on this football program. I believe in what we're doing, and I believe in these players.",
      fiery: "Worried? I've been fired before. You think that scares me? I'm going to coach my butt off every day regardless. If they want to fire me, they know where to find me — I'll be in the office at 5 AM like always.",
    },
  },

  // ── PLAY CALLING CRITICISM ──
  {
    id: 16,
    category: "hostile_play_calling",
    question: "You ran the ball 45 times and only threw it 12 times. Is that really a modern offense?",
    tone: "hostile",
    contextTags: ["play_calling", "offensive_philosophy", "criticism"],
    responses: {
      honest: "We ran the ball because it was working. We were averaging six yards a carry. Why would I stop doing what's working?",
      deflect: "We call what we think gives us the best chance to win based on what the defense is giving us.",
      coachspeak: "We're going to be balanced when we need to be balanced and run-heavy when we need to be run-heavy. It's about execution, not ratios.",
      fiery: "Modern offense? We scored 38 points. What part of 38 points isn't modern enough for you?",
    },
  },
  {
    id: 17,
    category: "hostile_play_calling",
    question: "You went for it on fourth down three times and converted zero. At what point is that aggressive strategy hurting the team?",
    tone: "hostile",
    contextTags: ["play_calling", "fourth_down", "criticism"],
    responses: {
      honest: "The analytics say go for it in those situations. We didn't execute tonight, but the philosophy is sound.",
      deflect: "We make those decisions based on a lot of factors — field position, game situation, personnel. Sometimes they don't work out.",
      coachspeak: "We're always going to be aggressive. That's our identity. We'll look at the execution and get better, but the approach isn't changing.",
      fiery: "Hurting the team? We're 8-2. I'll take my decision-making against anybody's in the country.",
    },
  },

  // ── PREDECESSOR COMPARISON ──
  {
    id: 18,
    category: "hostile_predecessor",
    question: "Under the previous coach, this program was in the playoff every year. What's different now?",
    tone: "hostile",
    contextTags: ["predecessor", "comparison", "program_standards"],
    responses: {
      honest: "Different coach, different era. I have tremendous respect for what was built here before me, and I'm working every day to build on that foundation in my own way.",
      deflect: "I'm focused on the present and the future. I can't compare myself to anyone else.",
      coachspeak: "This program has an incredible tradition, and we're working every day to uphold those standards. We're building something that will sustain success long term.",
      fiery: "I didn't come here to be anybody else. I came here to be me and to win. If you want to compare, wait until I'm done.",
    },
  },

  // ── PLAYER DEVELOPMENT ──
  {
    id: 19,
    category: "friendly_player_development",
    question: "Talk about the growth you've seen from your quarterback this season.",
    tone: "friendly",
    contextTags: ["player_development", "quarterback", "growth"],
    responses: {
      honest: "Night and day from where he was in the spring. His decision-making, his command of the offense, his leadership — he's become the guy we knew he could be.",
      deflect: "He's done a great job. He's a hard worker, and he's gotten better every week. Credit to him and to our QB coach.",
      coachspeak: "He's a product of the process. He trusted the coaching, he put in the work, and you're seeing the results on the field.",
      fiery: "That kid is special. I told y'all in August. Nobody believed me. Now look at him. He's playing as well as anybody in the country.",
    },
  },
  {
    id: 20,
    category: "friendly_player_development",
    question: "Your true freshman has really come on. Did you expect him to contribute this much this early?",
    tone: "friendly",
    contextTags: ["player_development", "freshman"],
    responses: {
      honest: "Honestly, no. We thought he'd redshirt. But he came in this summer and was so physically ready that we couldn't keep him off the field.",
      deflect: "He's a talented young man who worked his way into the lineup. We'll continue to develop him.",
      coachspeak: "When players are ready, they play. It doesn't matter if they're a freshman or a fifth-year senior. He showed us in camp that he belonged.",
      fiery: "I recruited him for a reason. I saw something in him that nobody else saw. The kid is a future first-round pick. Book it.",
    },
  },

  // ── TEAM CHEMISTRY / MOMENTUM ──
  {
    id: 21,
    category: "friendly_chemistry",
    question: "This team seems really close. What's the chemistry like in the locker room?",
    tone: "friendly",
    contextTags: ["team_chemistry", "locker_room", "culture"],
    responses: {
      honest: "This is as tight a group as I've ever coached. They genuinely love each other. When you have that kind of bond, guys play harder because they don't want to let each other down.",
      deflect: "The chemistry is good. Our guys enjoy being around each other, and that shows up on Saturdays.",
      coachspeak: "Team chemistry is a product of shared sacrifice. These guys have been through a lot together, and that forges a bond that shows up in big moments.",
      fiery: "This locker room is family. Real family. Not the fake stuff you see at other places. These guys would go to war for each other.",
    },
  },
  {
    id: 22,
    category: "friendly_momentum",
    question: "You've won five straight. What's the vibe like around the program right now?",
    tone: "friendly",
    contextTags: ["winning_streak", "momentum", "confidence"],
    responses: {
      honest: "Confidence is high, but we're trying to stay even-keeled. Five wins ago nobody was talking about us. We want to keep the same mentality.",
      deflect: "We take it one game at a time. The streak is nice, but we're focused on the next one.",
      coachspeak: "The energy is good, but we emphasize consistency of preparation over results. We prepare the same way whether we've won five or lost five.",
      fiery: "The vibe? Hungry. That's the vibe. We haven't done anything yet. Five wins is great, but we came here to win them all.",
    },
  },

  // ── RIVALRY WEEK ──
  {
    id: 23,
    category: "rivalry_pregame",
    question: "Rivalry week is here. How do you handle the emotions and distractions?",
    tone: "friendly",
    contextTags: ["rivalry", "rivalry_week", "preparation"],
    responses: {
      honest: "You don't suppress it — you channel it. These games are emotional, and they should be. But the team that plays with controlled aggression and discipline is the team that wins.",
      deflect: "We prepare the same way we do every week. We respect the tradition and the rivalry, but our process doesn't change.",
      coachspeak: "This is a special week, and our players understand what it means. We embrace it and use the emotion as fuel while staying disciplined.",
      fiery: "Distractions? This isn't a distraction. This is why you come to play here. This is the game you circle on the calendar. Our guys live for this.",
    },
  },
  {
    id: 24,
    category: "rivalry_pregame",
    question: "Their quarterback said your defense is 'overrated' this week. Any response?",
    tone: "neutral",
    contextTags: ["rivalry", "trash_talk", "bulletin_board_material"],
    responses: {
      honest: "I saw that. I don't need to provide bulletin board material — he did it for me. Our guys will be ready.",
      deflect: "I don't comment on what other teams' players say. We'll let our play speak for itself on Saturday.",
      coachspeak: "He's a great player and a competitor. I'm sure he's confident in his team, just like I'm confident in mine. It'll be decided on the field.",
      fiery: "Overrated? That's cute. He can come say that to our guys' faces on Saturday. We'll see how overrated he thinks we are after the first quarter.",
    },
  },
  {
    id: 25,
    category: "rivalry_postgame",
    question: "What does it mean to bring the trophy back home?",
    tone: "friendly",
    contextTags: ["rivalry", "post_win", "trophy", "tradition"],
    responses: {
      honest: "Everything. This means everything to our players, our fans, this university. This trophy belongs here, and we went and got it back.",
      deflect: "It's a great feeling. Our guys earned it. It's a special night for this program.",
      coachspeak: "Rivalries are what make college football the greatest sport in the world. Tonight, our guys represented this university with pride.",
      fiery: "It means that trophy is staying right here. We're not giving it back. They're going to have to come take it from us.",
    },
  },

  // ── PLAYOFF / RANKINGS ──
  {
    id: 26,
    category: "season_arc_playoff",
    question: "If you win out, you're likely in the playoff. How do you keep the team focused?",
    tone: "neutral",
    contextTags: ["playoff", "rankings", "focus"],
    responses: {
      honest: "It's hard. The noise is louder than it's ever been. But our leadership council does a great job of keeping guys grounded. We have a '1-0 each week' mentality.",
      deflect: "We're not thinking about the playoff. We're thinking about Saturday. If we take care of Saturday, everything else takes care of itself.",
      coachspeak: "The only game that matters is the next one. Our players understand that the path to our goals runs through this week's preparation.",
      fiery: "Focused? My guys are locked in. Don't worry about our focus. Worry about the team that has to play us this week.",
    },
  },
  {
    id: 27,
    category: "season_arc_playoff",
    question: "The committee has you ranked lower than expected. Do you feel disrespected?",
    tone: "gotcha",
    contextTags: ["playoff", "rankings", "committee", "disrespect"],
    responses: {
      honest: "Look, I think our resume speaks for itself. But I'm not on the committee, so all we can do is keep winning.",
      deflect: "Rankings in November don't mean anything. The only ranking that matters is the final one.",
      coachspeak: "We respect the committee's process. Our job is to go out and win football games, and we trust that the rest will take care of itself.",
      fiery: "We've beaten three ranked teams on the road. If that doesn't move the needle, I don't know what does. Just keep winning and make it so obvious they can't leave you out.",
    },
  },
  {
    id: 28,
    category: "season_arc_rankings",
    question: "You cracked the top ten for the first time in years. What does that milestone mean?",
    tone: "friendly",
    contextTags: ["rankings", "program_building", "milestone"],
    responses: {
      honest: "It's validation for the work these kids have put in. Years ago, people wondered if this program could compete at this level. Being top ten says we belong. But we're not satisfied.",
      deflect: "It's nice recognition, but rankings don't win championships. We've still got a lot of work to do.",
      coachspeak: "It's a testament to the culture we've built and the commitment of our student-athletes. But the only poll that matters is the final one.",
      fiery: "Years of grinding, years of people telling us we couldn't do it. Top ten. And we're just getting started.",
    },
  },

  // ── RECRUITING / PORTAL / NIL ──
  {
    id: 29,
    category: "recruiting_class",
    question: "You just signed a top recruiting class. What does this mean for the program?",
    tone: "friendly",
    contextTags: ["recruiting", "signing_day", "program_building"],
    responses: {
      honest: "It means the best players in the country want to be here. That's the ultimate validation. But now we've got to develop them. Rankings don't play on Saturdays.",
      deflect: "We're excited about this class. Great families, great players, great fits. But the real work starts when they get on campus.",
      coachspeak: "This class is a reflection of our entire program. We recruited to our needs and got players who fit our culture.",
      fiery: "People told me we couldn't recruit at this level. Guess what? We just did. And next year we're going to do it again.",
    },
  },
  {
    id: 30,
    category: "recruiting_portal",
    question: "You lost starters to the transfer portal. How do you handle that in today's climate?",
    tone: "neutral",
    contextTags: ["transfer_portal", "roster_management", "attrition"],
    responses: {
      honest: "It's the reality of college football now. It stings, because you invest in those guys. But we wish them well, and we'll use the portal ourselves to fill those spots.",
      deflect: "Roster movement happens. We focus on the guys who are committed to this program and this vision.",
      coachspeak: "The portal is part of the landscape now. We've always said we want guys who want to be here. We'll address our roster needs and move forward.",
      fiery: "Guys left? Okay. The next man up is going to be hungrier than they ever were. I promise you that.",
    },
  },
  {
    id: 31,
    category: "recruiting_portal",
    question: "You brought in several transfer portal players. Are you building a program or renting one?",
    tone: "hostile",
    contextTags: ["transfer_portal", "program_building", "criticism"],
    responses: {
      honest: "We're doing both — we have a core of developed guys and supplemented with proven players at positions of need. That's smart roster management.",
      deflect: "We're using every tool available to us to build the best roster possible. The portal is one of those tools.",
      coachspeak: "We believe in developing our own players, and we also believe in utilizing the portal strategically. It's about finding the right fit.",
      fiery: "Renting? Every single one of those guys chose to be here. They bought in from day one. Don't insult them by calling it renting.",
    },
  },
  {
    id: 32,
    category: "recruiting_nil",
    question: "There are reports your NIL collective is spending huge money. Is that sustainable?",
    tone: "gotcha",
    contextTags: ["NIL", "money", "sustainability", "criticism"],
    responses: {
      honest: "I don't get into the specifics of NIL numbers. What I will say is our collective is run by passionate supporters who do things the right way.",
      deflect: "That's a question for our NIL collective, not for me. I coach football. I don't manage NIL deals.",
      coachspeak: "We're fortunate to have a passionate fanbase. Everything is done with full compliance and transparency.",
      fiery: "Sustainable? Have you seen our fanbase? If you want to compete at this level, you better have people willing to invest. We do.",
    },
  },
  {
    id: 33,
    category: "recruiting_nil",
    question: "Your top recruit decommitted reportedly for a bigger NIL deal elsewhere. How do you compete?",
    tone: "neutral",
    contextTags: ["NIL", "recruiting", "decommitment"],
    responses: {
      honest: "It's frustrating. We want guys who are coming here for the development, the education, and the chance to win. If that's not enough, then this wasn't the right fit.",
      deflect: "I'm not going to comment on individual recruiting situations. We recruit guys who want to be part of what we're building.",
      coachspeak: "Recruiting is fluid. We'll continue to recruit to our standards and find players who align with our values.",
      fiery: "Good. I want guys who want to be HERE. Not the highest bidder. If money is all you're chasing, this ain't the place for you. And I'm fine with that.",
    },
  },

  // ── QB CONTROVERSY ──
  {
    id: 34,
    category: "quarterback_controversy",
    question: "Are you going to name a starting quarterback, or is this a two-QB system?",
    tone: "neutral",
    contextTags: ["quarterback", "depth_chart", "competition"],
    responses: {
      honest: "We'll make a decision by Saturday. Both guys have earned the right to play, but I believe you need a starter. A team needs to know who the guy is.",
      deflect: "We're still evaluating. Both guys are competing, and we'll make the best decision for our football team.",
      coachspeak: "We have two capable quarterbacks, and that's a good problem to have. We'll make the decision that gives us the best chance to win.",
      fiery: "I know who my quarterback is. I'm just not telling you. You'll find out on Saturday like everybody else.",
    },
  },
  {
    id: 35,
    category: "quarterback_controversy",
    question: "Your backup came in and led a comeback. How can you go back to the starter?",
    tone: "gotcha",
    contextTags: ["quarterback", "comeback", "qb_controversy"],
    responses: {
      honest: "It's a fair question. The backup played great. But I owe it to both guys to make the right decision based on the full body of work, not one quarter.",
      deflect: "We'll evaluate everything on film and make the best decision for the team going forward.",
      coachspeak: "Both quarterbacks are valued members of this team. Whoever gives us the best chance to win is who's going to play.",
      fiery: "You want me to make a quarterback decision at the podium right now? That's not how this works. I'll tell my players first.",
    },
  },

  // ── ICONIC PATTERNS ──
  {
    id: 36,
    category: "iconic_rant",
    question: "After three turnovers tonight, what's broken with this offense?",
    tone: "hostile",
    contextTags: ["turnovers", "offensive_struggles", "rant_trigger"],
    responses: {
      honest: "Ball security. We work on it every single day in practice, and then we put the ball on the ground. It's maddening.",
      deflect: "We had some costly mistakes. We'll get back in the lab and work on taking care of the football.",
      coachspeak: "Turnovers are the number one factor in wins and losses. We've got to do a better job of protecting the football.",
      fiery: "I'll tell you what's broken — our ball security. And I'm going to fix it if I have to make them carry a football to every class, every meal, everywhere they go for the rest of the season.",
    },
  },
  {
    id: 37,
    category: "iconic_social_media",
    question: "You're getting a lot of criticism on social media. Do you pay attention to that?",
    tone: "gotcha",
    contextTags: ["social_media", "criticism", "fan_reaction"],
    responses: {
      honest: "I'd be lying if I said it doesn't reach me. But you can't coach based on Twitter. The people in this building are the only opinions that matter.",
      deflect: "I don't have social media. I've got enough people yelling at me in real life.",
      coachspeak: "I try to stay away from social media. It's not productive. I trust the people in our building and the process we've established.",
      fiery: "Social media? I don't have time for social media. I'm too busy watching film. Maybe if some of these people watched as much film as they spent on Twitter, they'd understand what we're doing.",
    },
  },

  // ── OFFICIATING ──
  {
    id: 38,
    category: "ref_controversy",
    question: "There were some questionable calls tonight. Do you feel the officiating impacted the outcome?",
    tone: "gotcha",
    contextTags: ["officiating", "refs", "controversy", "post_loss"],
    responses: {
      honest: "I'm not going to comment on the officiating because it'll cost me money. I'll just say there were some calls I didn't agree with.",
      deflect: "I'm not going to go there. Officiating is what it is. We had our chances and didn't capitalize.",
      coachspeak: "The officials have a tough job, and I respect that. We can't put ourselves in a position where the game comes down to a call.",
      fiery: "I'd love to answer that question. I really would. But my wallet says I shouldn't. So I'll just say there were some plays that could have gone differently.",
    },
  },

  // ── HALFTIME / COMEBACKS ──
  {
    id: 39,
    category: "halftime_adjustments",
    question: "You were down big at halftime and came back to win. What was said in the locker room?",
    tone: "friendly",
    contextTags: ["halftime", "adjustments", "comeback", "post_win"],
    responses: {
      honest: "I told them the truth: we were getting our butts kicked, and we had a choice — lay down or fight. They answered that question in the second half.",
      deflect: "We made some adjustments schematically, and our guys executed. That's the short version.",
      coachspeak: "Our coaching staff made some excellent adjustments, and our players responded. That kind of halftime response shows the character of this team.",
      fiery: "What was said? That's between me and those guys in that locker room. But I'll tell you this — it wasn't pretty. And they came out with fire in their eyes.",
    },
  },

  // ── SENIOR DAY / EMOTION ──
  {
    id: 40,
    category: "senior_day",
    question: "It's senior day. What has this senior class meant to the program?",
    tone: "friendly",
    contextTags: ["senior_day", "emotion", "gratitude", "legacy"],
    responses: {
      honest: "I'm going to get emotional talking about it. This group transformed this program. They were here when we were 3-9, and now we're competing for a championship. I love those guys.",
      deflect: "They've meant everything. A great group of young men who gave everything to this program.",
      coachspeak: "This senior class leaves behind a legacy of toughness, character, and commitment. They've raised the standard for every class that comes after them.",
      fiery: "Those seniors are the foundation of everything you see here. Every win, every accomplishment — it traces back to what they sacrificed.",
    },
  },

  // ── SPECIAL TEAMS ──
  {
    id: 41,
    category: "special_teams",
    question: "The muffed punt changed the game. How do you address special teams breakdowns?",
    tone: "neutral",
    contextTags: ["special_teams", "mistakes", "post_loss"],
    responses: {
      honest: "It's inexcusable. We practice that every day. The kid feels terrible, and I feel for him, but we've got to be better. That's a coaching issue as much as a player issue.",
      deflect: "Special teams is a phase we've got to clean up. We'll address it this week.",
      coachspeak: "The hidden yardage in the kicking game is something we emphasize every week. When you don't execute, it can cost you, and tonight it did.",
      fiery: "I'm not going to hang a kid out to dry at the podium. He made a mistake. But I guarantee you we are going to fix our special teams. We will live out there in practice until we get it right.",
    },
  },

  // ── SEASON BOOKENDS ──
  {
    id: 42,
    category: "season_opener",
    question: "First game of the season. How does it feel to be back?",
    tone: "friendly",
    contextTags: ["season_opener", "week_one", "anticipation"],
    responses: {
      honest: "There's nothing like week one. The nerves, the excitement, the energy — after eight months of offseason work, you finally get to see it on the field. It's the best feeling in sports.",
      deflect: "It's good to be back playing games. We've put in a lot of work this offseason, and now it's time to see where we are.",
      coachspeak: "The start of a new season is always exciting. Our players have prepared diligently, and we're eager to compete.",
      fiery: "It feels like Christmas morning. I've been waiting for this since January. Our guys are ready. They've been dying to hit somebody in a different colored jersey.",
    },
  },
  {
    id: 43,
    category: "end_of_season",
    question: "As you look back on this season, how would you characterize it?",
    tone: "neutral",
    contextTags: ["season_review", "reflection", "end_of_season"],
    responses: {
      honest: "A tale of two halves. We started slow, found our identity, and finished strong. There are things I'd do differently, but I'm proud of how this team grew.",
      deflect: "We had ups and downs like every team. We grew as a group, and we're set up well for the future.",
      coachspeak: "This season was about growth and development. We faced adversity, learned from it, and became a better football team. The foundation has been laid.",
      fiery: "Unfinished business. That's how I'd characterize it. We left meat on the bone, and that's going to fuel us this offseason. We're coming back hungry.",
    },
  },

  // ── COACHING PHILOSOPHY ──
  {
    id: 44,
    category: "coaching_philosophy",
    question: "You've been called an old-school coach in a new-school world. How do you balance tradition with evolution?",
    tone: "neutral",
    contextTags: ["philosophy", "evolution", "identity"],
    responses: {
      honest: "I've had to evolve. The game changes, and if you don't change with it, you get left behind. But toughness, discipline, accountability — those are timeless.",
      deflect: "I just try to do what's best for our team. If that means adapting, we adapt. If it means sticking with what works, we stick with it.",
      coachspeak: "We believe in blending proven principles with modern innovation. The core values don't change, but tactics evolve with the game.",
      fiery: "Old school? I'll take that as a compliment. Blocking, tackling, and discipline never go out of style. But don't mistake me for someone who doesn't adapt.",
    },
  },

  // ── WEATHER / HOSTILE ENVIRONMENT ──
  {
    id: 45,
    category: "weather_conditions",
    question: "Brutal conditions out there tonight. How much did the weather factor in?",
    tone: "neutral",
    contextTags: ["weather", "conditions", "game_factors"],
    responses: {
      honest: "Huge factor. You can't throw the ball in that wind, so it became a ground game on both sides. We prepared for it, but conditions like that impact the game no matter what.",
      deflect: "Same conditions for both teams. We dealt with it.",
      coachspeak: "Football is an outdoor sport, and you've got to be able to play in any environment. Our guys adjusted well.",
      fiery: "This is football, not tennis. You play in whatever Mother Nature throws at you. Our guys loved it out there. That's toughness.",
    },
  },
  {
    id: 46,
    category: "hostile_environment",
    question: "That was 100,000-plus fans in a hostile environment. How did your guys handle the noise?",
    tone: "neutral",
    contextTags: ["road_game", "hostile_environment", "crowd"],
    responses: {
      honest: "It was loud. Louder than I expected. We had some communication issues early, but we settled in. That's a hard place to play.",
      deflect: "Our guys have played in big environments before. We prepared for the noise all week.",
      coachspeak: "Playing in hostile environments is part of college football. Our preparation with the crowd noise in practice paid off.",
      fiery: "100,000 people screaming at you, and our guys didn't blink. That tells you everything you need to know about this team. We thrive in chaos.",
    },
  },

  // ── DISCIPLINE / CULTURE ──
  {
    id: 47,
    category: "discipline",
    question: "You suspended two starters for a violation of team rules. Can you elaborate?",
    tone: "neutral",
    contextTags: ["discipline", "suspension", "team_rules", "culture"],
    responses: {
      honest: "I won't get into specifics out of respect for the players. But we have standards, and when you don't meet them, there are consequences. Nobody is above the team.",
      deflect: "It's an internal matter. We addressed it and we're moving forward.",
      coachspeak: "We have clearly defined standards. Accountability is a core value. When those standards aren't met, we handle it consistently.",
      fiery: "I don't care if you're an All-American or a walk-on — you violate the rules, you sit. Period.",
    },
  },

  // ── INJURY / NFL DRAFT ──
  {
    id: 48,
    category: "injury",
    question: "Any update on your star player who left the game in the third quarter?",
    tone: "neutral",
    contextTags: ["injury", "player_status"],
    responses: {
      honest: "He's getting looked at right now. I don't have a definitive answer yet. I'll know more tomorrow.",
      deflect: "I don't have an update at this time. We'll know more when the medical staff has fully evaluated him.",
      coachspeak: "His health and well-being are our top priority. We'll follow the medical team's guidance and provide an update when appropriate.",
      fiery: "He's tough as nails. I wouldn't bet against him being out there next week. But I'm not a doctor, so we'll let the docs do their thing.",
    },
  },
  {
    id: 49,
    category: "nfl_draft",
    question: "Your star is projected as a top pick. How do you handle the draft buzz?",
    tone: "neutral",
    contextTags: ["NFL_draft", "player_future", "distraction"],
    responses: {
      honest: "He deserves it. He's earned every bit of buzz. My job is to make sure he stays focused on finishing this season strong.",
      deflect: "We don't talk about the draft during the season. That's for after. Right now he's focused on us.",
      coachspeak: "He's a tremendous player with a bright future. But he's committed to this team and this season.",
      fiery: "That kid is going to be a millionaire, and he deserves every penny. But right now he doesn't care about the draft. He cares about winning a championship.",
    },
  },

  // ── PRESEASON EXPECTATIONS ──
  {
    id: 50,
    category: "preseason_expectations",
    question: "You're ranked in the preseason top five. Are you comfortable with those expectations?",
    tone: "neutral",
    contextTags: ["preseason", "rankings", "expectations"],
    responses: {
      honest: "We've earned it with the roster we've put together. But preseason rankings mean absolutely nothing. We've got to go prove it.",
      deflect: "Rankings in August don't mean anything. Ask me about rankings in November.",
      coachspeak: "We appreciate the recognition, but expectations are just that — expectations. The only thing that matters is performance.",
      fiery: "Comfortable? I'd be uncomfortable if we weren't there. We've got the players, the coaches, and the culture. Now we've got to go do it.",
    },
  },
];

/**
 * Select question patterns that match the given game context.
 */
export function selectPatterns(
  result: "W" | "L",
  margin: number,
  context: {
    isRivalry?: boolean;
    isUpset?: boolean;
    hotSeat?: boolean;
    ranking?: number | null;
    streak?: number;
    week?: number;
  }
): PressQuestionPattern[] {
  const isBlowout = margin >= 21;
  const isClose = margin <= 7;

  return PRESS_CONFERENCE_DB.filter((p) => {
    const tags = p.contextTags;

    // Match result
    if (result === "W" && tags.includes("post_loss") && !tags.includes("post_win")) return false;
    if (result === "L" && tags.includes("post_win") && !tags.includes("post_loss")) return false;

    // Blowout/close filtering
    if (isBlowout && tags.includes("close_game")) return false;
    if (isClose && tags.includes("blowout")) return false;

    // Context-specific
    if (tags.includes("rivalry") && !context.isRivalry) return false;
    if (tags.includes("upset") && !context.isUpset) return false;
    if (tags.includes("hot_seat") && !context.hotSeat) return false;

    return true;
  });
}
