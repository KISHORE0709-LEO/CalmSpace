/**
 * Mitra Reply Engine
 * Keyword + intent matching → warm, relevant, ASD-appropriate responses for children.
 * No API key needed — runs fully in the browser.
 */

interface ReplyRule {
  keywords: string[];
  replies: string[];
}

const rules: ReplyRule[] = [
  // Bullying / hurt by others
  {
    keywords: ["bully", "bullied", "bullying", "hit me", "pushed me", "called me names", "made fun", "laughed at me", "teased", "mean to me", "hurt me", "they hurt"],
    replies: [
      "Oh no, I'm so sorry that happened to you. 💙 That was really wrong of them, and it is NOT your fault. You are so brave for telling me. Can you tell me a little more about what happened?",
      "That sounds really painful, and I want you to know — you did nothing wrong. Nobody deserves to be treated that way. I'm right here with you. 🌸",
      "I hear you, and I believe you. Being bullied feels awful, and your feelings make complete sense. You are safe here with me. Would you like to talk about it more?",
    ],
  },
  // Sad / depressed / crying
  {
    keywords: ["sad", "depressed", "crying", "cry", "tears", "unhappy", "miserable", "heartbroken", "broken", "feel bad", "feeling bad", "feel terrible"],
    replies: [
      "I can hear that you're feeling really sad right now, and that's okay. 💙 Your feelings are real and they matter. I'm right here — you don't have to feel this alone.",
      "It's okay to feel sad sometimes. Even the bravest people cry. 🌧️ Would you like to take a slow breath together? In for four counts... and out for four. I'll do it with you.",
      "I'm so glad you told me how you're feeling. Sadness can feel really heavy. Let's sit with it together for a moment — you are not alone. 🌸",
    ],
  },
  // Angry / frustrated
  {
    keywords: ["angry", "anger", "mad", "furious", "frustrated", "annoyed", "hate", "so angry", "really mad", "upset"],
    replies: [
      "It sounds like something made you really angry. That feeling is totally valid! 😤 Can you tell me what happened? I want to understand.",
      "Anger can feel like a fire inside, can't it? 🔥 Let's try something — squeeze your hands into fists really tight... and then let go slowly. Did that help a little?",
      "I hear you — you're really frustrated right now. That makes sense. Let's figure this out together. What's making you feel this way?",
    ],
  },
  // Scared / anxious / worried
  {
    keywords: ["scared", "afraid", "fear", "fearful", "anxious", "anxiety", "worried", "worry", "nervous", "panic", "panicking", "frightened", "terrified"],
    replies: [
      "It's okay to feel scared — even superheroes get scared sometimes. 🦸 I'm right here with you. Can you tell me what's making you feel this way?",
      "I hear you — feeling anxious is really hard. Let's try a calming breath together: breathe in slowly for 4... hold for 2... and breathe out for 4. You're doing great. 💙",
      "Your feelings are completely valid. When we feel worried, our body is just trying to protect us. You are safe right now. Want to talk about what's on your mind? 🌸",
    ],
  },
  // School problems
  {
    keywords: ["school", "teacher", "class", "homework", "test", "exam", "grade", "fail", "failed", "study", "learning", "lesson"],
    replies: [
      "School can be really tough sometimes! 📚 What's going on — is it something with a teacher, a subject, or maybe other kids?",
      "I understand — school can feel overwhelming. You're not alone in feeling that way. What part is the hardest for you right now?",
      "It sounds like school is stressing you out. That's really common, and it doesn't mean anything is wrong with you. Let's talk about it — what happened today?",
    ],
  },
  // Friends / loneliness
  {
    keywords: ["friend", "friends", "lonely", "alone", "no one", "nobody", "left out", "excluded", "ignored", "no friends", "don't have friends"],
    replies: [
      "Feeling lonely is one of the hardest feelings. 💙 I want you to know — you matter so much, and you deserve kind friends. Can you tell me more about what happened?",
      "I'm really glad you have me to talk to. 🌸 Feeling left out hurts a lot. You are not invisible — I see you, and I care about you.",
      "Making friends can be really hard, especially when people don't understand you. But you are wonderful just as you are. What would your perfect friend be like?",
    ],
  },
  // Family problems
  {
    keywords: ["mom", "dad", "parent", "family", "brother", "sister", "home", "fight", "arguing", "yelled", "shouted"],
    replies: [
      "It sounds like things at home are feeling difficult right now. 💙 That can be really stressful. I'm here to listen — what happened?",
      "Family situations can be really hard to deal with. Your feelings about it are completely valid. Would you like to tell me more?",
      "I hear you. When the people we love upset us, it hurts even more. You're safe here — tell me what's going on. 🌸",
    ],
  },
  // Happy / good day
  {
    keywords: ["happy", "great", "awesome", "amazing", "good day", "wonderful", "excited", "fun", "loved it", "enjoyed", "best day"],
    replies: [
      "That makes me SO happy to hear! 🎉 Tell me everything — what made today so great?",
      "Yay! 🌟 I love hearing when you're feeling good! What was the best part of your day?",
      "That's wonderful! 😊 You deserve all the good days. What happened that made you feel this way?",
    ],
  },
  // Tired / exhausted
  {
    keywords: ["tired", "exhausted", "sleepy", "no energy", "worn out", "drained", "can't do it", "too much"],
    replies: [
      "It sounds like you've been working really hard and your body and mind need a rest. 😴 That's completely okay. What's been making you feel so tired?",
      "Being tired is your body's way of saying 'I need a break.' You're allowed to rest. 💙 Is there something specific that's been draining your energy?",
      "I hear you — sometimes everything just feels like too much. Let's take it one small step at a time. What feels the heaviest right now?",
    ],
  },
  // Calming / breathing request
  {
    keywords: ["calm", "calm down", "help me calm", "breathe", "breathing", "relax", "relaxing", "peace", "quiet"],
    replies: [
      "Let's do this together. 🌬️ Breathe in slowly through your nose for 4 counts... 1, 2, 3, 4. Now hold for 2... and breathe out through your mouth for 4... 1, 2, 3, 4. How do you feel?",
      "I'm right here with you. 💙 Close your eyes if you can. Imagine a calm, safe place — maybe a beach, or your favourite cozy spot. Take a slow breath in... and out. You're doing so well.",
      "Let's try the 5-4-3-2-1 trick together. Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. This helps our brain feel safe. 🌸",
    ],
  },
  // Story request
  {
    keywords: ["story", "tell me a story", "story time", "read me"],
    replies: [
      "Ooh, I love stories! 📖 Here's one: Once upon a time, there was a little star who was afraid of the dark. But one night, she realised — she WAS the light. And from that day on, she was never afraid again. Just like you — you have a light inside you too. ✨",
      "Once there was a small turtle named Teo who moved slowly but always got where he needed to go. Everyone rushed past him, but Teo knew something they didn't — the journey is the best part. 🐢 You're like Teo — steady, strong, and wonderful.",
    ],
  },
  // Greetings
  {
    keywords: ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "how are you"],
    replies: [
      "Hi there! 🌼 I'm so happy you're here. How are you feeling today? You can tell me anything — I'm always listening.",
      "Hello, friend! 💙 It's so good to see you. What's on your mind today?",
      "Hey! 🌸 I was just thinking about you. How is your heart feeling today?",
    ],
  },
  // "I don't know" / confused
  {
    keywords: ["don't know", "idk", "not sure", "confused", "don't understand", "weird feeling", "strange"],
    replies: [
      "That's completely okay — sometimes feelings are hard to name. 💙 Can you tell me where you feel it in your body? Like, does your tummy feel tight, or your chest feel heavy?",
      "It's okay not to know exactly how you feel. Sometimes feelings are like clouds — they change shape. Let's figure it out together. What happened today?",
      "You don't have to have the perfect words. Just tell me anything — even a little bit — and we'll work it out together. 🌸",
    ],
  },
];

const fallbackReplies = [
  "Thank you for sharing that with me. 💙 I want to make sure I understand — can you tell me a little more about how that made you feel?",
  "I hear you, and I'm really glad you told me. 🌸 What happened next? I want to know everything.",
  "That sounds really important. You have my full attention. Can you tell me more so I can help you better?",
  "I'm listening so carefully to you. 💙 Your feelings matter a lot to me. What would help you feel a little better right now?",
  "Thank you for trusting me with that. 🌟 I'm always here for you. What do you need from me right now — do you want to talk more, or would a calming activity help?",
];

export function getMitraReply(userMessage: string): string {
  const msg = userMessage.toLowerCase();

  for (const rule of rules) {
    if (rule.keywords.some(kw => msg.includes(kw))) {
      return rule.replies[Math.floor(Math.random() * rule.replies.length)];
    }
  }

  return fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
}
