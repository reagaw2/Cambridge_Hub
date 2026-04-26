/**
 * csEthicsBank.js — Ethics and Ownership question bank
 * CS data store only — completely separate from Physics.
 */

const SCHEMA_3 = {
  type: "object",
  properties: {
    marks_earned: { type: "number" },
    mark_1: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned", "keyword", "found", "feedback"] },
    mark_2: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned", "keyword", "found", "feedback"] },
    mark_3: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned", "keyword", "found", "feedback"] },
    cambridge_insight: { type: "string" },
    next_step: { type: "string" },
  },
  required: ["marks_earned", "mark_1", "cambridge_insight", "next_step"],
};

const SCHEMA_2 = {
  type: "object",
  properties: {
    marks_earned: { type: "number" },
    mark_1: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned", "keyword", "found", "feedback"] },
    mark_2: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned", "keyword", "found", "feedback"] },
    cambridge_insight: { type: "string" },
    next_step: { type: "string" },
  },
  required: ["marks_earned", "mark_1", "cambridge_insight", "next_step"],
};

export const ETHICS_QUESTIONS = [
  {
    id: "9618-w21-qp13-Q4a",
    label: "Question 4(a)",
    paper_ref: "9618/13 · Oct/Nov 2021",
    topic: "Ethics and Ownership",
    topic_key: "ethics_and_ownership",
    text: "Describe the benefits to a programmer of joining a professional ethical body.",
    total_marks: 3,
    response_schema: SCHEMA_3,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Describe the benefits to a programmer of joining a professional ethical body.

Mark scheme — any three of the following:
- B1: the programmer has ethical guidelines to follow so clients and other staff know the standards being applied
- B1: the programmer does not have to decide what is ethical because it is written down
- B1: clients and staff know the programmer is reputable and there is recognition of skills and knowledge
- B1: there may be a test or requirements for entry
- B1: the body provides help and support such as legal advice
- B1: the body runs training courses to keep skills up to date

Student's answer: ${answer}

Award 1 mark for each distinct valid point up to 3. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "ethical guidelines to follow / clients know standards being applied", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "does not have to decide what is ethical / it is written down", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "provides help and support / training courses / recognition of skills / entry requirements", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-w21-qp13-Q4b-i",
    label: "Question 4(b)(i)",
    paper_ref: "9618/13 · Oct/Nov 2021",
    topic: "Ethics and Ownership",
    topic_key: "ethics_and_ownership",
    text: "A programmer has been asked to use software they have not used before. Describe the ways in which the programmer can act ethically in this situation.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: A programmer has been asked to use software they have not used before. Describe the ways in which the programmer can act ethically in this situation.

Mark scheme — any two of the following:
- B1: tell the manager they have not used it and explain how they will get up to date
- B1: perform their own research on how to use it
- B1: explain to the manager that additional training is needed
- B1: ask the manager to book them on a training course
- B1: ask for a mentor or to shadow someone
- B1: practise at home before starting

Student's answer: ${answer}

Award 1 mark for each distinct valid point up to 2. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "any valid ethical action — tell manager / research independently / request training / ask for mentor / practise beforehand", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "a second different valid ethical action", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-w21-qp13-Q4c",
    label: "Question 4(c)",
    paper_ref: "9618/13 · Oct/Nov 2021",
    topic: "Ethics and Ownership",
    topic_key: "ethics_and_ownership",
    text: "A programmer discovers an error in the software but does not report it. Explain the reasons why the programmer acted unethically in this situation.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: A programmer discovers an error in the software but does not report it. Explain why the programmer acted unethically.

Mark scheme — any two of the following:
- B1: did not act in the best interest of the product because the product might fail
- B1: did not act in the best interest of the client because if the product does not work they have been let down
- B1: did not act in the best interest of the profession because they are letting the profession down
- B1: did not act in the best interest of the company because not correcting the error early could lead to later problems

Student's answer: ${answer}

Award 1 mark for each distinct valid point up to 2. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "did not act in best interest of product / client / profession / company", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "a second different stakeholder harmed by not reporting the error", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-w22-qp13-Q8a-i",
    label: "Question 8(a)(i)",
    paper_ref: "9618/13 · Oct/Nov 2022",
    topic: "Ethics and Ownership",
    topic_key: "ethics_and_ownership",
    text: "Explain why some programs are distributed under an open source licence.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Explain why some programs are distributed under an open source licence.

Mark scheme — any two of the following:
- B1: to allow users to customise the code
- B1: to allow errors to be reported or identified or fixed by users
- B1: to allow additional features to be added to the code
- B1: to allow for collaboration

Student's answer: ${answer}

Award 1 mark for each distinct valid point up to 2. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "any valid open source reason — customise code / errors fixed by users / add features / collaboration", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "a second different valid open source reason", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-w22-qp13-Q8a-ii",
    label: "Question 8(a)(ii)",
    paper_ref: "9618/13 · Oct/Nov 2022",
    topic: "Ethics and Ownership",
    topic_key: "ethics_and_ownership",
    text: "Explain how a programmer benefits from distributing a program under a commercial licence.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Explain how a programmer benefits from distributing a program under a commercial licence.

Mark scheme — any two of the following:
- B1: enables the program to be copyrighted
- B1: prevents illegal changes to the program or protects the source code
- B1: prevents illegal copies of the program being made
- B1: a fee can be charged for the program

Student's answer: ${answer}

Award 1 mark for each distinct valid point up to 2. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "any valid commercial licence benefit — copyright / prevents illegal changes / prevents illegal copies / fee can be charged", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "a second different valid commercial licence benefit", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-w22-qp13-Q8b",
    label: "Question 8(b)",
    paper_ref: "9618/13 · Oct/Nov 2022",
    topic: "Ethics and Ownership",
    topic_key: "ethics_and_ownership",
    text: "A commercial program for a vehicle repair garage includes an Artificial Intelligence module that can diagnose faults and suggest repairs. Describe one economic impact the AI module may have on the garage.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Describe one economic impact that an AI module used to diagnose vehicle faults may have on a repair garage.

Mark scheme:
- B1 mark 1: a valid economic impact — reduced costs because less time taken for diagnosis OR increased profits as technicians spend more time repairing OR decreased costs passed to customer so garage may gain customers OR profit margins reduced because program may be expensive to buy or maintain
- B1 mark 2: a corresponding description or explanation of that economic impact

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "valid economic impact stated — reduced costs / increased profits / cheaper for customers / expensive to maintain", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "corresponding explanation of the stated economic impact", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-w22-qp12-Q9",
    label: "Question 9",
    paper_ref: "9618/12 · Oct/Nov 2022",
    topic: "Ethics and Ownership",
    topic_key: "ethics_and_ownership",
    text: "Describe the social impact of using facial recognition software to identify individuals in an airport.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Describe the social impact of using facial recognition software to identify individuals in an airport.

Mark scheme — any two of the following:
- B1: incorrect recognition of faces leads to mistakes such as access to facilities or systems may be denied
- B1: privacy issues because people do not like data being stored
- B1: individuals will feel safer
- B1: there might be a reduction in crime
- B1: faster boarding
- B1: catching criminals

Student's answer: ${answer}

Award 1 mark for each distinct valid point up to 2. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "any valid social impact — incorrect recognition / privacy issues / feel safer / reduction in crime / faster boarding / catching criminals", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "a second different valid social impact", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-s21-qp12-Q2a",
    label: "Question 2(a)",
    paper_ref: "9618/12 · May/Jun 2021",
    topic: "Ethics and Ownership",
    topic_key: "ethics_and_ownership",
    text: "Explain the reasons why it is important that a team leader acts ethically in relation to their team members.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Explain the reasons why it is important that a team leader acts ethically in relation to their team members.

Mark scheme — any two of the following:
- B1: to make sure the team members feel valued
- B1: to get the best work out of the team
- B1: to enable them to work well together
- B1: to enable them to create the best product for the client

Student's answer: ${answer}

Award 1 mark for each distinct valid point up to 2. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "any valid reason — team members feel valued / best work from team / work well together / best product for client", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "a second different valid reason", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-w23-qp13-Q6a",
    label: "Question 6(a)",
    paper_ref: "9618/13 · Oct/Nov 2023",
    topic: "Ethics and Ownership",
    topic_key: "ethics_and_ownership",
    text: "State two benefits to a programmer of distributing a program using a shareware licence.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: State two benefits to a programmer of distributing a program using a shareware licence.

Mark scheme — any two of the following:
- B1: users are able to trial the program and may offer the programmer constructive feedback
- B1: more people might try the program because the trial is free of charge
- B1: allows bugs to be found and corrected on a wide range of computer system configurations
- B1: users that find the trial useful will buy the program so programmer gets income
- B1: allows the program to be copyrighted and protects the programmer's intellectual property rights

Student's answer: ${answer}

Award 1 mark for each distinct valid point up to 2. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "any valid shareware benefit — constructive feedback / more users try it / bugs found / income from purchases / copyright protection", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "a second different valid shareware benefit", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "Q_9618_13_N25_007",
    label: "Question 7(a)",
    paper_ref: "9618/13 · Oct/Nov 2025",
    topic: "Ethics and Ownership",
    topic_key: "ethics_and_ownership",
    text: "A digital video camera uses AI to analyse footage and identify when students are interacting with a lesson. Describe one ethical impact of this use of AI in the classroom.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: A digital video camera uses AI to analyse footage and identify when students are interacting with a lesson. Describe one ethical impact of this use of AI in the classroom.

Mark scheme — any one impact plus elaboration:
- B1 mark 1: any one from — privacy concerns as students/teachers uncomfortable with surveillance / mental health concerns due to constant monitoring / learning could be improved by identifying struggling students
- B1 mark 2: corresponding elaboration of the chosen impact and its consequence

Student's answer: ${answer}

Both a negative and a positive ethical impact are acceptable. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "valid ethical impact stated — privacy concerns / mental health concerns / improved learning / surveillance discomfort", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "elaboration connecting the impact to a real consequence", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
];

const INDEX_KEY = "cs_ethics_question_index";

export function getNextEthicsQuestion() {
  const idx = parseInt(sessionStorage.getItem(INDEX_KEY) ?? "0", 10) % ETHICS_QUESTIONS.length;
  return { question: ETHICS_QUESTIONS[idx], idx, total: ETHICS_QUESTIONS.length };
}

export function advanceEthicsIndex() {
  const idx = parseInt(sessionStorage.getItem(INDEX_KEY) ?? "0", 10);
  sessionStorage.setItem(INDEX_KEY, String(idx + 1));
}