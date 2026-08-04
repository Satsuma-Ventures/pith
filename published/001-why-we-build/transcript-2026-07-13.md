# Why We Build — Interview Transcript
*Session date: 2026-07-13 · Phase: Extraction · Status: Complete*
*Note: Lightly edited for readability. Run-on speech preserved where it captures texture.*

---

**Q: When you look at how companies are adopting AI right now — not the hype, the actual behavior — what's the most common mistake you see them making?**

The most common mistakes I see are:

1. Not understanding the nuances of AI and instead just thinking about it as a GPT-style text input prompt
2. Not understanding the two fundamental revolutionary opportunities AI has unlocked: AI-powered products and AI-powered people and process
3. Thinking that they need to solve bigger problems first before bringing AI into the picture
4. Not understanding that it's a new, ever-evolving thing and that teams and individuals need to constantly be learning — instead choosing to throw out really talented people because they aren't experts in AI. Well, shit, no one is an expert at first.

---

**Q: On the second point — AI-powered products versus AI-powered people and process. Most people only see the first one. How did you come to see the second, and why do you think it gets missed?**

A lot of it started from my own personal learning journey with AI. I was looking for opportunities to do more with ChatGPT, Microsoft Copilot, Claude, etc., and the opportunities that I was finding were my own personal force multipliers rather than opportunities to incorporate AI capabilities into the products that I was building, as our engineering teams just frankly weren't up to the task of even understanding AI to the level they needed to build stuff. So I started experimenting with how I might automate the things that were frankly tedious to do as a product manager, and found that it significantly simplified the things that I didn't care to do in the role while also improving the quality of the output.

It did require a really robust set of inputs to make sure that the quality of output was really good, but it created a lot of consistent structure that we could apply. It effectively generated a strong contract between our product organization and engineering, and it allowed me to really focus on a high-level strategic lens while still owning and maintaining a tactical delivery responsibility.

I think a lot of companies continue to think about AI from the perspective of ChatGPT because that's the level of exposure that they have, when the reality is the things that are most easily automated are the existing things rather than the net new things that need definition — because the existing things are the ones that already have the clearest definition, guardrails, structure, and rules, and those are the things that AI needs to be successful. So instead, they jump into creating solutions with AI because it's AI and not because AI is the right thing to solution with, and they miss the bigger opportunities to accelerate what they're doing as a business — which in many cases is not building AI into the product, but rather the people.

---

**Q: You mentioned "a really robust set of inputs" being the key to quality output. What does that actually look like in practice?**

It's really hard to find what "good" is, especially because it really depends on the level of fidelity that you're looking for. Really rich, robust brownfield environments have a ton of existing context to pull from, and that gives you an opportunity to feed that context in and provide a synthesized perspective on top of it, such that the agentic tools have enough of the foundational context as well as the directional strategic context to make meaningful progress. But it also means that they need to have a really robust set of guardrails and guidance around what is not enough context in the specific environment that they're operating within.

And it's really up to the spectrum and framework — or the standards of a business, or really any of the things that would prevent an investment from going forward without having achieved a certain quality bar — those are the things that really have to exist. And you need definition at the leadership level so that teams can operate with that constraint without having to go through a ton of manual processes as part of it.

*[Correction logged: brownfield environments are not inherently easier. In many cases, brownfield comes with baggage and prior art that may be fundamentally flawed because it originated from a way of working that is now obsolete. Greenfield projects are often far more effective at threading AI-driven process end-to-end because you can build in the rules and structure and guidance that ensure things are being built in a consistent way — human-readable as well as machine-readable.]*

---

**Q: You mentioned AI unlocked your ability to stay strategic while still owning tactical delivery — the altitude vs. execution tension. What did that actually look like concretely?**

Altitude versus execution is such an interesting challenge that we have as product leaders. It's really easy to zoom in and focus on execution at the expense of strategy because execution is immediate-term and if it fails, you feel that pain immediately. However, if strategy fails, you feel that pain completely. So it's always been my philosophy that you need to focus on strategy first before execution, because execution without strategy has no real merit for the enterprise at scale.

With the rise of these agentic tools — and most recently something I've been playing around with is a spec-driven development framework called the BMad method — they operate as force multipliers to be able to translate strategy at an initiative level (so I think a quarter or more worth of work) and make that accessible to build and deliver at an order of magnitude less, more at the level of an epic. And that translates as well to an epic now being deliverable at the same level as a story has been.

So the idea of owning strategy while simultaneously owning execution started to actually converge, because that strategy can not only incorporate the goals, objectives, outcomes, and the big investments that we want to make, but it can also inform that foundational context for the execution that the agentic tools actually can deliver.

*[Expansion: the right agentic tools and frameworks do enough elicitation from the user to hopefully offset the information accuracy problem, and can have enough access to data across the organization such that they can validate insights against tangible data points. Also: Satsuma has its own version of a spec-driven development framework — the playbook in Claude, with markdown skill files that take the secret sauce of what we do and democratize it across the organization. That's the type of thing that successful companies take advantage of: force multipliers with the right structure, but perhaps more importantly, the right opportunity to deliver the value that they can deliver.]*

---

**Q: Shifting to who benefits — who is the person Satsuma is trying to help, and what does their life look like before and after?**

I don't know if I can answer that specifically in terms of a persona. But what I can say is that I really want Satsuma to help people who today feel powerless with the rate of change in the world that's happening because of the advent of the modern AI world, and I want them to feel empowered. And I want our enterprises to be focused on empowering those who may not otherwise have the power to do things themselves.

---

**Q: What's the thing about how people talk about AI right now that most frustrates you?**

There's so much negative sentiment around AI in the world today, especially as we think about it as a job replacement thing. That's compounded the way that people view AI in such a negative light. And I think what has happened is that now people no longer see the positive opportunities for what they are. They simply look at them and immediately gravitate toward the "where's the poop" of that positive story, which is actually a pretty cynical way of approaching the world.

I see the real opportunity for Satsuma — as we think about the positive impact that we want to have on society — is helping people realize the potential that AI offers to them as individuals and to society at large. And understand that sure, there are absolutely going to be negatives to it. But there are positives to it. And much like our companies don't necessarily know how to use AI properly, individuals who are not exposed to it also don't know how to use it properly — and again rely on reporting from the media about what it can do or what it's doing that's negative, rather than using it themselves and seeing if it actually is as bad as all they hear.

---

## Architecture notes
*Captured post-interview*

**Opening tension:** Everyone's talking about AI but most of it is either hype or fear. Neither is useful.

**The observation:** The companies and people getting the most from AI aren't doing what you'd expect. They're not building AI products. They're restructuring how they work.

**The inversion:** Execution is getting cheap. Strategy — real strategy, with context and clarity and structure — is getting more valuable, not less.

**The thesis:** The differentiator isn't the model. It's the packaging. The framework. The structure that makes AI useful to someone who doesn't already know how to use it.

**The purpose:** Satsuma exists to build that packaging — and to put it in reach of people who today feel like AI is happening to them rather than for them.

**The call:** Not "use AI." But "here's how to actually use it."

