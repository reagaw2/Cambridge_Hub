/**
 * csDataSecurityBank.js — Data Security question bank
 * CS data store only — completely separate from Physics.
 */

const SCHEMA_6 = {
  type: "object",
  properties: {
    marks_earned: { type: "number" },
    mark_1: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned","keyword","found","feedback"] },
    mark_2: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned","keyword","found","feedback"] },
    mark_3: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned","keyword","found","feedback"] },
    mark_4: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned","keyword","found","feedback"] },
    mark_5: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned","keyword","found","feedback"] },
    mark_6: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned","keyword","found","feedback"] },
    cambridge_insight: { type: "string" },
    next_step: { type: "string" },
  },
  required: ["marks_earned","mark_1","cambridge_insight","next_step"],
};

const SCHEMA_3 = {
  type: "object",
  properties: {
    marks_earned: { type: "number" },
    mark_1: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned","keyword","found","feedback"] },
    mark_2: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned","keyword","found","feedback"] },
    mark_3: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned","keyword","found","feedback"] },
    cambridge_insight: { type: "string" },
    next_step: { type: "string" },
  },
  required: ["marks_earned","mark_1","cambridge_insight","next_step"],
};

const SCHEMA_2 = {
  type: "object",
  properties: {
    marks_earned: { type: "number" },
    mark_1: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned","keyword","found","feedback"] },
    mark_2: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned","keyword","found","feedback"] },
    cambridge_insight: { type: "string" },
    next_step: { type: "string" },
  },
  required: ["marks_earned","mark_1","cambridge_insight","next_step"],
};

const SCHEMA_1 = {
  type: "object",
  properties: {
    marks_earned: { type: "number" },
    mark_1: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned","keyword","found","feedback"] },
    cambridge_insight: { type: "string" },
    next_step: { type: "string" },
  },
  required: ["marks_earned","mark_1","cambridge_insight","next_step"],
};

export const DATA_SECURITY_QUESTIONS = [
  {
    id: "9618-w21-13-Q2a",
    label: "Question 2(a)",
    paper_ref: "9618/13 · Oct/Nov 2021",
    topic: "Data Security",
    topic_key: "data_security",
    text: "Explain the difference between data security and data integrity.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Explain the difference between data security and data integrity.

Mark scheme:
- B1 mark 1: security is protecting data from loss or corruption
- B1 mark 2: integrity is ensuring the consistency or accuracy of the data

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "security is protecting data from loss or corruption", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "integrity is ensuring consistency or accuracy of data", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-w21-13-Q2c",
    label: "Question 2(c)",
    paper_ref: "9618/13 · Oct/Nov 2021",
    topic: "Data Security",
    topic_key: "data_security",
    text: "Two malware threats are spyware and viruses. Give two similarities and one difference between spyware and a virus.",
    total_marks: 3,
    response_schema: SCHEMA_3,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Give two similarities and one difference between spyware and a virus.

Mark scheme:
- B1 mark 1 similarity: both are pieces of malicious software
- B1 mark 2 similarity: both are downloaded or installed or run without the user's knowledge OR both can be embedded in other legitimate software OR both run in the background
- B1 mark 3 difference: virus can damage computer data whereas spyware only records or accesses data OR virus does not send data out of the computer whereas spyware sends recorded data to a third party OR virus replicates itself whereas spyware does not replicate itself

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "both are malicious software", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "both installed without user knowledge / both embedded in legitimate software / both run in background", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "virus damages data / virus does not send data / virus replicates — spyware does not", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-s22-11-Q3a",
    label: "Question 3(a)",
    paper_ref: "9618/11 · May/Jun 2022",
    topic: "Data Security",
    topic_key: "data_security",
    text: "State the difference between the security of data and the privacy of data.",
    total_marks: 1,
    response_schema: SCHEMA_1,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: State the difference between the security of data and the privacy of data.

Mark scheme:
- B1 mark 1: security prevents against loss while privacy prevents unauthorised access

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "security prevents loss / privacy prevents unauthorised access", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-s22-11-Q3b",
    label: "Question 3(b)",
    paper_ref: "9618/11 · May/Jun 2022",
    topic: "Data Security",
    topic_key: "data_security",
    text: "Identify and describe two threats to data. Identify one security measure to protect against each threat. Each security measure must be different.",
    total_marks: 6,
    response_schema: SCHEMA_6,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Identify and describe two threats to data and identify one security measure to protect against each threat.

Mark scheme — 3 marks per threat:
- B1: threat 1 identified — malware OR hacker or unauthorised access OR spyware
- B1: threat 1 described — malicious software that replicates and can delete or damage data OR illegal access to delete or damage data OR software installed without knowledge that records keystrokes and sends data to a third party
- B1: threat 1 security measure — install and run anti-malware OR use a firewall OR strong passwords OR anti-spyware OR virtual onscreen keyboard
- B1: threat 2 identified — any different valid threat
- B1: threat 2 described — corresponding description
- B1: threat 2 security measure — different security measure from threat 1

Student's answer: ${answer}

Award 1 mark per point up to 6. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 6], "mark_1": { "earned": true or false, "keyword": "first threat identified — malware / hacking / spyware", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "description of first threat", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "security measure for first threat", "found": true or false, "feedback": "one sentence explanation" }, "mark_4": { "earned": true or false, "keyword": "second different threat identified", "found": true or false, "feedback": "one sentence explanation" }, "mark_5": { "earned": true or false, "keyword": "description of second threat", "found": true or false, "feedback": "one sentence explanation" }, "mark_6": { "earned": true or false, "keyword": "different security measure for second threat", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-w22-12-Q6ai",
    label: "Question 6(a)(i)",
    paper_ref: "9618/12 · Oct/Nov 2022",
    topic: "Data Security",
    topic_key: "data_security",
    text: "Explain how a digital signature ensures an email is authentic.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Explain how a digital signature ensures an email is authentic.

Mark scheme:
- B1 mark 1: the email message is put through a hashing algorithm to produce a digest
- B1 mark 2: the digest is encrypted with the sender's private key to create the digital signature which can only be decrypted with the matching sender's public key

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "message put through hashing algorithm to produce a digest", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "digest encrypted with sender's private key / can only be decrypted with sender's public key", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-w22-12-Q6aii",
    label: "Question 6(a)(ii)",
    paper_ref: "9618/12 · Oct/Nov 2022",
    topic: "Data Security",
    topic_key: "data_security",
    text: "Describe how a firewall protects the data on a computer.",
    total_marks: 3,
    response_schema: SCHEMA_3,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Describe how a firewall protects the data on a computer.

Mark scheme — any three of the following:
- B1: monitors incoming and outgoing packets or traffic
- B1: checks against an allow list or deny list of IP addresses OR checks against a set of rules for acceptable data or ports
- B1: blocks transmissions that do not meet the criteria or rules OR allows through if it satisfies the criteria or rules

Student's answer: ${answer}

Award 1 mark for each distinct valid point up to 3. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "monitors incoming and outgoing packets or traffic", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "checks against allow list or deny list / checks against rules for acceptable data or ports", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "blocks transmissions that do not meet rules / allows through if satisfies criteria", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-s22-13-Q5ai",
    label: "Question 5(a)(i)",
    paper_ref: "9618/13 · May/Jun 2022",
    topic: "Data Security",
    topic_key: "data_security",
    text: "State why data needs to be kept secure.",
    total_marks: 1,
    response_schema: SCHEMA_1,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: State why data needs to be kept secure.

Mark scheme:
- B1 mark 1: to stop the data being lost or corrupted or amended OR to make sure it can be recovered OR to prevent unauthorised access

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "prevent data loss or corruption or amendment / ensure recovery / prevent unauthorised access", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-s22-13-Q5aii",
    label: "Question 5(a)(ii)",
    paper_ref: "9618/13 · May/Jun 2022",
    topic: "Data Security",
    topic_key: "data_security",
    text: "One way the data stored in a computer can be kept secure is by using back-up software. Give two other ways the data stored in a computer can be kept secure.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Give two ways other than back-up software that data stored in a computer can be kept secure.

Mark scheme — any two of the following:
- B1: install or run a firewall OR up to date anti-virus or anti-malware
- B1: username and strong password OR encryption OR access rights

Student's answer: ${answer}

Award 1 mark for each distinct valid method up to 2. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "firewall / anti-virus / anti-malware", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "strong password / encryption / access rights", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-s22-12-Q4a",
    label: "Question 4(a)",
    paper_ref: "9618/12 · May/Jun 2022",
    topic: "Data Security",
    topic_key: "data_security",
    text: "Explain why a school needs to keep both its data and its computer system secure from unauthorised access.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Explain why a school needs to keep both its data and its computer system secure from unauthorised access.

Mark scheme:
- B1 mark 1: data needs protecting from someone amending or deleting or taking it
- B1 mark 2: computer system needs protecting to stop people installing malware or damaging the system

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "data needs protecting from amendment or deletion or theft", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "system needs protecting from malware installation or damage", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-s22-12-Q4c",
    label: "Question 4(c)",
    paper_ref: "9618/12 · May/Jun 2022",
    topic: "Data Security",
    topic_key: "data_security",
    text: "Data is encrypted when it is transmitted. Describe what is meant by encryption and explain why it is used.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Describe what is meant by encryption and explain why it is used.

Mark scheme:
- B1 mark 1: data is turned into cipher text OR data is encoded
- B1 mark 2: used so that it cannot be understood if intercepted without the decryption key

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "data turned into cipher text / data is encoded", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "cannot be understood if intercepted without decryption key", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-s21-12-Q8b",
    label: "Question 8(b)",
    paper_ref: "9618/12 · May/Jun 2021",
    topic: "Data Security",
    topic_key: "data_security",
    text: "Identify one software-based measure that could be used to restrict access to data on computers.",
    total_marks: 1,
    response_schema: SCHEMA_1,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Identify one software-based measure that could be used to restrict access to data on computers.

Mark scheme:
- B1 mark 1: two factor authentication OR biometric passwords OR key card access OR firewall

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "two factor authentication / biometric passwords / key card access / firewall", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-s21-12-Q8c",
    label: "Question 8(c)",
    paper_ref: "9618/12 · May/Jun 2021",
    topic: "Data Security",
    topic_key: "data_security",
    text: "Identify two threats to data that are posed by networks and the internet.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Identify two threats to data posed by networks and the internet.

Mark scheme:
- B1 mark 1: malware OR viruses OR spyware
- B1 mark 2: hacking OR phishing OR pharming

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "malware / viruses / spyware", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "hacking / phishing / pharming", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-w23-13-Q3aiii",
    label: "Question 3(a)(iii)",
    paper_ref: "9618/13 · Oct/Nov 2023",
    topic: "Data Security",
    topic_key: "data_security",
    text: "State how the following security measures can be used to protect computer systems: Firewall, Encryption, Passwords.",
    total_marks: 3,
    response_schema: SCHEMA_3,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: State how firewall, encryption, and passwords can be used to protect computer systems.

Mark scheme:
- B1 mark 1 firewall: monitors incoming and outgoing traffic and rejects any traffic that does not meet the set rules
- B1 mark 2 encryption: ensures that if data is intercepted it cannot be understood without the decryption key
- B1 mark 3 passwords: ensures only users with the correct password can access the resources OR prevents unauthorised access

Student's answer: ${answer}

Award 1 mark for each correct description up to 3. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "firewall monitors traffic and rejects traffic not meeting rules", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "encryption means intercepted data cannot be understood without decryption key", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "passwords ensure only authorised users can access resources", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-w23-13-Q8b",
    label: "Question 8(b)",
    paper_ref: "9618/13 · Oct/Nov 2023",
    topic: "Data Security",
    topic_key: "data_security",
    text: "State one difference and one similarity between pharming and phishing.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: State one difference and one similarity between pharming and phishing.

Mark scheme:
- B1 mark 1 difference: pharming is malicious code that redirects to a fake website whereas phishing uses an email to prompt user action OR pharming is automatic whereas phishing requires user action
- B1 mark 2 similarity: both try to obtain financial or personal information OR both make use of fake websites OR both are a false representation of an official organisation

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "pharming redirects automatically / phishing uses email and requires user action", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "both obtain personal or financial information / both use fake websites / both impersonate official organisations", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-w23-13-Q8c",
    label: "Question 8(c)",
    paper_ref: "9618/13 · Oct/Nov 2023",
    topic: "Data Security",
    topic_key: "data_security",
    text: "Explain how the data security risks of malware can be restricted.",
    total_marks: 3,
    response_schema: SCHEMA_3,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Explain how the data security risks of malware can be restricted.

Mark scheme — any three of the following:
- B1: download programs from reputable websites as these are less likely to contain malware OR install and run anti-malware so regular scans can be made for known malware
- B1: and if malware is found it can be quarantined or removed OR anti-malware definitions are regularly updated
- B1: use a firewall to block unused ports so malware cannot enter OR avoid use of removable devices so malware cannot be installed from them OR deny administrator privileges to everyday users so malware cannot be downloaded

Student's answer: ${answer}

Award 1 mark for each distinct valid point up to 3. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "download from reputable sources / install and run anti-malware", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "quarantine or remove malware found / keep anti-malware definitions updated", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "use firewall to block ports / avoid removable devices / deny admin privileges", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-s25-11-Q7a",
    label: "Question 7(a)",
    paper_ref: "9618/11 · May/Jun 2025",
    topic: "Data Security",
    topic_key: "data_security",
    text: "A banker needs to transfer confidential data across the internet. Identify and describe one method of restricting the risks posed by an unauthorised person intercepting the data.",
    total_marks: 3,
    response_schema: SCHEMA_3,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Identify and describe one method of restricting the risks of data interception during internet transfer.

Mark scheme:
- B1 mark 1: encryption
- B1 mark 2: data is encoded or scrambled using a key to create cipher text
- B1 mark 3: if intercepted it cannot be understood without being decrypted using a key

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "encryption identified", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "data encoded or scrambled using a key to create cipher text", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "cannot be understood without decryption key", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-s24-12-Q3ai",
    label: "Question 3(a)(i)",
    paper_ref: "9618/12 · May/Jun 2024",
    topic: "Data Security",
    topic_key: "data_security",
    text: "Authentication methods can help to protect a server against hackers. Identify one other security measure that helps to protect the server from hackers. Describe how the security measure works.",
    total_marks: 3,
    response_schema: SCHEMA_3,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Identify one security measure other than authentication that protects a server from hackers and describe how it works.

Mark scheme:
- B1 mark 1: firewall OR proxy server
- B1 mark 2: firewall — checks incoming connections against criteria or blocks data from specific ports or blocks data not meeting whitelist OR proxy server — prevents direct access to server or intercepts requests or forwards request using its own IP address
- B1 mark 3: further relevant development of the description

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "firewall OR proxy server", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "firewall checks connections or blocks ports / proxy intercepts requests or uses own IP", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "further development of the security measure description", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-s24-12-Q3aii",
    label: "Question 3(a)(ii)",
    paper_ref: "9618/12 · May/Jun 2024",
    topic: "Data Security",
    topic_key: "data_security",
    text: "Identify one security measure that helps to protect data when it is being transmitted to its destination. Describe how the security measure works.",
    total_marks: 3,
    response_schema: SCHEMA_3,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Identify one security measure that protects data during transmission and describe how it works.

Mark scheme:
- B1 mark 1: encryption
- B1 mark 2: encodes or scrambles data so if it is intercepted it cannot be understood
- B1 mark 3: algorithm or key is required to decode the data

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "encryption identified", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "encodes or scrambles data so it cannot be understood if intercepted", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "algorithm or key required to decode the data", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "Q_9618_13_N25_005",
    label: "Question 5(d)",
    paper_ref: "9618/13 · Oct/Nov 2025",
    topic: "Data Security",
    topic_key: "data_security",
    text: "Describe two ways in which a Database Management System (DBMS) can be used to ensure the security of customer data.",
    total_marks: 4,
    response_schema: {
      type: "object",
      properties: {
        marks_earned: { type: "number" },
        mark_1: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned","keyword","found","feedback"] },
        mark_2: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned","keyword","found","feedback"] },
        mark_3: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned","keyword","found","feedback"] },
        mark_4: { type: "object", properties: { earned: { type: "boolean" }, keyword: { type: "string" }, found: { type: "boolean" }, feedback: { type: "string" } }, required: ["earned","keyword","found","feedback"] },
        cambridge_insight: { type: "string" },
        next_step: { type: "string" },
      },
      required: ["marks_earned","mark_1","cambridge_insight","next_step"],
    },
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Describe two ways in which a Database Management System (DBMS) can be used to ensure the security of customer data.

Mark scheme — 2 marks per way (method + justification):
- B1 mark 1: authentication methods / passwords / biometrics / 2-factor authentication can be implemented
- B1 mark 2: ...which prevents unauthorised access to the customer data
- B1 mark 3: second method — access rights can be set / data encrypted / backups scheduled / different views created
- B1 mark 4: ...corresponding justification for the second method chosen

Student's answer: ${answer}

Award 1 mark for each valid method and 1 mark for each corresponding security justification, maximum 4 total. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 4], "mark_1": { "earned": true or false, "keyword": "first DBMS security method — authentication / passwords / biometrics / 2FA", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "justification — prevents unauthorised access to customer data", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "second DBMS security method — access rights / encryption / backups / views", "found": true or false, "feedback": "one sentence explanation" }, "mark_4": { "earned": true or false, "keyword": "corresponding justification for second method", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
];

const INDEX_KEY = "cs_data_security_question_index";

export function getNextDataSecurityQuestion() {
  const idx = parseInt(sessionStorage.getItem(INDEX_KEY) ?? "0", 10) % DATA_SECURITY_QUESTIONS.length;
  return { question: DATA_SECURITY_QUESTIONS[idx], idx, total: DATA_SECURITY_QUESTIONS.length };
}

export function advanceDataSecurityIndex() {
  const idx = parseInt(sessionStorage.getItem(INDEX_KEY) ?? "0", 10);
  sessionStorage.setItem(INDEX_KEY, String(idx + 1));
}