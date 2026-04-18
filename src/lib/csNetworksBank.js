/**
 * csNetworksBank.js — Networks and the Internet question bank
 * CS data store only — completely separate from Physics.
 */

const SCHEMA_4 = {
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

export const NETWORKS_QUESTIONS = [
  {
    id: "9618-11-MJ21-Q4a",
    label: "Question 4(a)",
    paper_ref: "9618/11 · May/Jun 2021",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "Describe the key features of a peer-to-peer network.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Describe the key features of a peer-to-peer network.

Mark scheme — any two of the following:
- B1: all computers are of equal status
- B1: each computer provides access to resources and data OR data is distributed OR computers can communicate and share resources OR each computer is responsible for its own security

Student's answer: ${answer}

Award 1 mark for each distinct valid point up to 2. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "all computers are of equal status", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "each computer provides access to resources / data is distributed / each computer responsible for own security", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-11-MJ21-Q4b",
    label: "Question 4(b)",
    paper_ref: "9618/11 · May/Jun 2021",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "Describe two drawbacks of using a peer-to-peer network.",
    total_marks: 4,
    response_schema: SCHEMA_4,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Describe two drawbacks of using a peer-to-peer network.

Mark scheme — 1 mark for identifying each drawback, 1 mark for describing it, maximum 2 per drawback:
- B1: reduced security OR no central management of security OR only as secure as the weakest computer OR each computer is at risk from viruses
- B1: no central management of backup OR if data from one computer is not backed up it is lost to all
- B1: no central management of files or software OR consistency may be difficult to maintain
- B1: individual computers may respond slower because they are being accessed by other computers OR files may not always be available if the host computer is switched off

Student's answer: ${answer}

Award 1 mark for each drawback identified and 1 mark for each description up to 4 total. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 4], "mark_1": { "earned": true or false, "keyword": "first valid drawback identified — security / backup / file management / performance", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "description of first drawback", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "second valid drawback identified", "found": true or false, "feedback": "one sentence explanation" }, "mark_4": { "earned": true or false, "keyword": "description of second drawback", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-11-MJ21-Q4d",
    label: "Question 4(d)",
    paper_ref: "9618/11 · May/Jun 2021",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "A user sends emails from a webmail account accessed through a website. Explain whether the user is using the internet, the World Wide Web, or both.",
    total_marks: 3,
    response_schema: SCHEMA_3,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: A user sends emails from a webmail account accessed through a website. Explain whether they are using the internet, the World Wide Web, or both.

Mark scheme:
- B1 mark 1: using the internet because sending data on the infrastructure
- B1 mark 2: using the WWW because accessing a website stored on a web server that is part of the WWW
- B1 mark 3: they are using both

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "using the internet because sending data on the infrastructure", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "using the WWW because accessing a website on a web server", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "using both", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-13-ON21-Q8a",
    label: "Question 8(a)",
    paper_ref: "9618/13 · Oct/Nov 2021",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "State whether a school network covering one building will be a LAN or a WAN. Justify your choice.",
    total_marks: 3,
    response_schema: SCHEMA_3,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: State whether a school network covering one building will be a LAN or WAN. Justify your choice.

Mark scheme:
- B1 mark 1: LAN
- B1 mark 2: covers a small geographical area
- B1 mark 3: no leasing of external infrastructure OR does not use the internet to transmit within the building

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "LAN", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "covers a small geographical area", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "no leasing of external infrastructure / does not use internet within the building", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-13-ON21-Q8b",
    label: "Question 8(b)",
    paper_ref: "9618/13 · Oct/Nov 2021",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "A classroom has 30 computers each with a network interface card. Identify two possible devices that can be used to physically connect the 30 computers to the rest of the network.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Identify two possible devices that can be used to physically connect computers to the rest of a network.

Mark scheme:
- B1 mark 1: router
- B1 mark 2: switch OR hub

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "router", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "switch OR hub", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-13-ON21-Q8c",
    label: "Question 8(c)",
    paper_ref: "9618/13 · Oct/Nov 2021",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "A laptop has a Wireless Network Interface Card. Describe the functions of a Wireless Network Interface Card.",
    total_marks: 4,
    response_schema: SCHEMA_4,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Describe the functions of a Wireless Network Interface Card.

Mark scheme — any four of the following:
- B1: provides interface to wireless network OR acts as an antenna
- B1: receives analogue radio waves OR converts them to digital or binary
- B1: checks incoming transmissions for correct MAC or IP address OR ignores transmissions not intended for it
- B1: encrypts or encodes the data OR decrypts or decodes the data OR takes digital input and converts to analogue waves OR sends radio waves via the antenna

Student's answer: ${answer}

Award 1 mark for each distinct valid point up to 4. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 4], "mark_1": { "earned": true or false, "keyword": "provides interface to wireless network / acts as antenna", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "receives analogue radio waves / converts to digital", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "checks MAC or IP address / ignores transmissions not intended for it", "found": true or false, "feedback": "one sentence explanation" }, "mark_4": { "earned": true or false, "keyword": "encrypts or decrypts data / converts digital to analogue / sends radio waves", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-13-ON22-Q7b",
    label: "Question 7(b)",
    paper_ref: "9618/13 · Oct/Nov 2022",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "Give one advantage and two disadvantages of transmitting data using satellites instead of copper cables.",
    total_marks: 3,
    response_schema: SCHEMA_3,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Give one advantage and two disadvantages of transmitting data using satellites instead of copper cables.

Mark scheme:
- B1 mark 1: advantage — not fixed to a single location OR allows access in remote or rural areas
- B1 mark 2: disadvantage 1 — high latency or lag OR more expensive than wired methods OR signal affected by bad weather OR slower transmission speed than fixed line broadband OR direct line of sight needed
- B1 mark 3: disadvantage 2 — a second distinct disadvantage from the above list

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "advantage — not fixed to location / allows access in remote areas", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "first disadvantage — high latency / expensive / weather affected / slower / line of sight needed", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "second distinct disadvantage", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-13-ON22-Q7c-i",
    label: "Question 7(c)(i)",
    paper_ref: "9618/13 · Oct/Nov 2022",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "Give two benefits of dividing a network into subnetworks by subnetting the LAN.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Give two benefits of dividing a network into subnetworks by subnetting the LAN.

Mark scheme — any two of the following:
- B1: improves security
- B1: reduces congestion OR allows extension of the network OR aids day-to-day management OR improves performance

Student's answer: ${answer}

Award 1 mark for each distinct valid benefit up to 2. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "improves security", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "reduces congestion / allows network extension / aids management / improves performance", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-12-ON22-Q10b-ii",
    label: "Question 10(b)(ii)",
    paper_ref: "9618/12 · Oct/Nov 2022",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "Describe the role and function of a router in a network.",
    total_marks: 3,
    response_schema: SCHEMA_3,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Describe the role and function of a router in a network.

Mark scheme — any three of the following:
- B1: receives packets from devices or internet OR finds destination of packets using the IP address
- B1: forwards packets to the destination OR assigns private IP addresses to devices on LAN OR stores or updates or maintains a routing table
- B1: finds most efficient path to destination OR maintains table of MAC and IP addresses OR provides the LAN with a public IP address OR acts as a gateway OR performs protocol conversion OR acts as a firewall

Student's answer: ${answer}

Award 1 mark for each distinct valid point up to 3. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "receives packets / finds destination using IP address", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "forwards packets / assigns private IP addresses / maintains routing table", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "finds most efficient path / acts as gateway / provides public IP address / performs protocol conversion", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-13-MJ22-Q8a",
    label: "Question 8(a)",
    paper_ref: "9618/13 · May/Jun 2022",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "Define cloud computing.",
    total_marks: 1,
    response_schema: SCHEMA_1,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Define cloud computing.

Mark scheme:
- B1 mark 1: accessing a service or files or software on a remote server

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "accessing services or files or software on a remote server", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-13-MJ22-Q8b",
    label: "Question 8(b)",
    paper_ref: "9618/13 · May/Jun 2022",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "State what is meant by a public cloud and a private cloud.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: State what is meant by a public cloud and a private cloud.

Mark scheme:
- B1 mark 1: public cloud — computing services offered by a third party provider over the public internet OR open and available to anyone with appropriate equipment or credentials
- B1 mark 2: private cloud — computing services offered over the internet or a private internal network OR only available to select users not the general public OR a dedicated system only accessible for the organisation

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "public cloud — third party provider over public internet / available to anyone", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "private cloud — only available to select users / dedicated system for the organisation", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-13-MJ22-Q8c",
    label: "Question 8(c)",
    paper_ref: "9618/13 · May/Jun 2022",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "Give two benefits and one drawback of using cloud computing.",
    total_marks: 3,
    response_schema: SCHEMA_3,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Give two benefits and one drawback of using cloud computing.

Mark scheme:
- B1 mark 1: benefit 1 — can be accessed anywhere with internet access OR do not need to install security OR do not need to perform backups OR do not need to buy specific software or hardware OR can easily share documents OR can have multiple people working on the same document
- B1 mark 2: benefit 2 — a second distinct benefit from the above list
- B1 mark 3: drawback — cannot access if no internet access OR reliant on someone else to backup OR reliant on someone else for security OR can have poorer security OR cannot access if server goes down

Student's answer: ${answer}

Award 1 mark per point up to 3. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "first valid benefit — accessible anywhere / no need for own security or backup / share documents / multiple users", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "second distinct valid benefit", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "valid drawback — no internet means no access / reliant on third party / server downtime", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-12-MJ22-Q9b",
    label: "Question 9(b)",
    paper_ref: "9618/12 · May/Jun 2022",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "Describe three differences between fibre-optic cables and copper cables.",
    total_marks: 3,
    response_schema: SCHEMA_3,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Describe three differences between fibre-optic cables and copper cables.

Mark scheme — any three of the following:
- B1: fibre optic data is transmitted using light whereas copper cable uses electrical signals
- B1: fibre optic has higher bandwidth or higher transmission rates OR smaller risk of noise interference than copper cable
- B1: fibre optic can be used over longer distances before repeaters are needed OR more difficult to hack into than copper cable OR more prone to damage than copper cable

Student's answer: ${answer}

Award 1 mark for each distinct valid difference up to 3. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "fibre uses light / copper uses electrical signals", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "fibre has higher bandwidth / higher transmission rates / less interference", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "fibre works over longer distances / harder to hack / more prone to damage", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-12-MJ22-Q9c",
    label: "Question 9(c)",
    paper_ref: "9618/12 · May/Jun 2022",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "Ethernet uses Carrier Sense Multiple Access/Collision Detection (CSMA/CD). Describe CSMA/CD.",
    total_marks: 4,
    response_schema: SCHEMA_4,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Ethernet uses CSMA/CD. Describe CSMA/CD.

Mark scheme — any four of the following:
- B1: a device wishing to transmit listens to the communication channel OR data is only sent when the channel is free
- B1: because more than one computer is connected to the same transmission medium OR two workstations can start to transmit at the same time causing a collision
- B1: if a collision happens the workstations send a jamming signal or abort transmission
- B1: each waits a random amount of time before attempting to resend

Student's answer: ${answer}

Award 1 mark for each distinct valid point up to 4. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 4], "mark_1": { "earned": true or false, "keyword": "device listens to channel / data only sent when channel is free", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "multiple computers on same medium / two can transmit at same time causing collision", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "collision detected — jamming signal sent / transmission aborted", "found": true or false, "feedback": "one sentence explanation" }, "mark_4": { "earned": true or false, "keyword": "each waits a random amount of time before resending", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-12-MJ23-Q1a",
    label: "Question 1(a)",
    paper_ref: "9618/12 · May/Jun 2023",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "Give two benefits of connecting computers to a LAN.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Give two benefits of connecting computers to a LAN.

Mark scheme — any two of the following:
- B1: allows the sharing of files or data OR allows communication between the devices
- B1: allows the sharing of resources such as hardware or software OR allows central management such as backup and security

Student's answer: ${answer}

Award 1 mark for each distinct valid benefit up to 2. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "sharing files or data / communication between devices", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "sharing resources / central management of backup or security", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-12-MJ23-Q1b",
    label: "Question 1(b)",
    paper_ref: "9618/12 · May/Jun 2023",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "Give two characteristics of a LAN.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Give two characteristics of a LAN.

Mark scheme:
- B1 mark 1: covers a small geographical area
- B1 mark 2: the infrastructure is privately owned OR not controlled by external organisations

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "covers a small geographical area", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "infrastructure is privately owned / not controlled by external organisations", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-12-MJ23-Q1d",
    label: "Question 1(d)",
    paper_ref: "9618/12 · May/Jun 2023",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "Computers can be connected using Ethernet. Describe what is meant by Ethernet.",
    total_marks: 3,
    response_schema: SCHEMA_3,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Describe what is meant by Ethernet.

Mark scheme — any three of the following:
- B1: a protocol suite OR for data transmission over standard wired or cabled network connections
- B1: uses Carrier Sense Multiple Access or Collision Detection (CSMA/CD)
- B1: data is transmitted in frames OR each frame has a source and destination IP or MAC address OR and error checking data so damaged frames can be resent

Student's answer: ${answer}

Award 1 mark for each distinct valid point up to 3. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "a protocol suite / for data transmission over wired network connections", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "uses CSMA/CD", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "data transmitted in frames with source and destination address and error checking", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-12-MJ23-Q1e",
    label: "Question 1(e)",
    paper_ref: "9618/12 · May/Jun 2023",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "The network runs as a thick-client model. Describe what is meant by a thick-client model.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Describe what is meant by a thick-client model.

Mark scheme:
- B1 mark 1: the server performs minimal or some processing for the client
- B1 mark 2: the clients do most of their own processing or work independently OR most of the resources are installed locally

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "server performs minimal or some processing for the client", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "clients do most of their own processing / resources installed locally", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-13-MJ23-Q2a",
    label: "Question 2(a)",
    paper_ref: "9618/13 · May/Jun 2023",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "Identify two differences between a WAN and a LAN.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Identify two differences between a WAN and a LAN.

Mark scheme — any two of the following:
- B1: WAN covers a large geographical area and LAN covers a small geographical area
- B1: LAN connections are usually physical whereas WAN connections are often virtual OR LAN has higher data transfer rate than WAN OR LAN ownership is private whereas WAN can be private or public OR LAN is usually more secure than WAN

Student's answer: ${answer}

Award 1 mark for each distinct valid difference up to 2. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "WAN covers large area / LAN covers small area", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "LAN connections physical / WAN virtual OR LAN faster / LAN privately owned / LAN more secure", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-13-MJ23-Q2b-i",
    label: "Question 2(b)(i)",
    paper_ref: "9618/13 · May/Jun 2023",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "In one building there are five computers connected in a mesh topology. Describe what is meant by a mesh topology.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Describe what is meant by a mesh topology.

Mark scheme:
- B1 mark 1: all computers are connected to at least one other device
- B1 mark 2: there are multiple routes between devices OR computers can act as relays passing packets on towards the final destination

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "all computers connected to at least one other device", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "multiple routes between devices / computers act as relays", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-13-MJ23-Q2b-ii",
    label: "Question 2(b)(ii)",
    paper_ref: "9618/13 · May/Jun 2023",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "Give two advantages of using a mesh topology instead of a bus topology.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Give two advantages of using a mesh topology instead of a bus topology.

Mark scheme — any two of the following:
- B1: if one line goes down there are more routes available OR improved security as not using one main line OR fewer collisions
- B1: new nodes can be added without interruption OR more secure because data is sent over a dedicated connection

Student's answer: ${answer}

Award 1 mark for each distinct valid advantage up to 2. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "more routes if one line fails / improved security / fewer collisions", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "new nodes added without interruption / data sent over dedicated connection", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-13-MJ23-Q2c",
    label: "Question 2(c)",
    paper_ref: "9618/13 · May/Jun 2023",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "Computers in one room are set up as thin-clients in a client-server model. Describe the role of the different computers in this model.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Describe the role of the different computers in a thin-client client-server model.

Mark scheme:
- B1 mark 1: server performs all processing required by the task and data storage
- B1 mark 2: clients only send requests to the server and display the returned results

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "server performs all processing and data storage", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "clients send requests to server and display returned results", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-13-MJ23-Q2d",
    label: "Question 2(d)",
    paper_ref: "9618/13 · May/Jun 2023",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "Students can connect their devices to the university network using cables or a wireless connection. Explain the benefits to the students of allowing them to use both wired and wireless connections.",
    total_marks: 4,
    response_schema: SCHEMA_4,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Explain the benefits to students of allowing both wired and wireless connections to the university network.

Mark scheme — any four of the following:
- B1: some students might only have one sort of connection on their device
- B1: wired provides better performance OR faster access OR less interference OR students can transmit private data securely
- B1: wireless connection means students can use their devices in different rooms or sites or outside OR student devices can be portable
- B1: wireless connection enables students to bring multiple devices OR bring their own devices OR change devices

Student's answer: ${answer}

Award 1 mark for each distinct valid point up to 4. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 4], "mark_1": { "earned": true or false, "keyword": "some students only have one type of connection", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "wired provides better performance / faster access / less interference / more secure", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "wireless allows use in different rooms or locations / devices are portable", "found": true or false, "feedback": "one sentence explanation" }, "mark_4": { "earned": true or false, "keyword": "wireless enables multiple devices / bring own devices / change devices", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-13-MJ23-Q2e",
    label: "Question 2(e)",
    paper_ref: "9618/13 · May/Jun 2023",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "An IP address in a subnetwork is divided into two parts. Identify and describe the two parts of an IP address in a subnetwork.",
    total_marks: 3,
    response_schema: SCHEMA_3,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Identify and describe the two parts of an IP address in a subnetwork.

Mark scheme:
- B1 mark 1: IP address is made up of a network ID and a host ID
- B1 mark 2: each device in a subnetwork has the same network ID OR each subnetwork has a different network ID
- B1 mark 3: every device in each subnetwork has a different host ID but the same network ID OR the host ID uniquely identifies the device within the subnetwork

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "network ID and host ID", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "each device in subnetwork has same network ID / each subnetwork has different network ID", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "host ID uniquely identifies the device within the subnetwork", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-11-ON22-Q8",
    label: "Question 8",
    paper_ref: "9618/11 · Oct/Nov 2022",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "A Local Area Network uses a bus topology. Describe how CSMA/CD is used in a bus network.",
    total_marks: 4,
    response_schema: SCHEMA_4,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Describe how CSMA/CD is used in a bus network.

Mark scheme — any four of the following:
- B1: CSMA/CD is a protocol used to detect and prevent collisions in a bus topology
- B1: before transmitting a device checks if the channel is busy OR if the channel is busy the device waits OR if the channel is free the data is sent
- B1: because more than one computer is connected to the same transmission medium OR two workstations can start to transmit at the same time causing a collision
- B1: if a collision is detected transmission is aborted or a jamming signal is transmitted OR both devices wait a different random time and then try again

Student's answer: ${answer}

Award 1 mark for each distinct valid point up to 4. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 4], "mark_1": { "earned": true or false, "keyword": "CSMA/CD is a protocol to detect and prevent collisions", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "device checks if channel is busy before transmitting / waits if busy / sends if free", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "multiple computers on same medium / two can transmit simultaneously causing collision", "found": true or false, "feedback": "one sentence explanation" }, "mark_4": { "earned": true or false, "keyword": "collision detected — transmission aborted / jamming signal sent / devices wait random time before retrying", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-11-MJ24-Q5a",
    label: "Question 5(a)",
    paper_ref: "9618/11 · May/Jun 2024",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "A bank uses a client-server model for customers to access their accounts. Describe the roles of the different devices in this model.",
    total_marks: 4,
    response_schema: SCHEMA_4,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Describe the roles of the different devices in a client-server model used by a bank.

Mark scheme:
- B1 mark 1: identification of the server in the bank scenario
- B1 mark 2: description of server — receives requests and processes them
- B1 mark 3: identification of the client in the bank scenario
- B1 mark 4: description of client — sends request to the server and waits for and outputs the response

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 4], "mark_1": { "earned": true or false, "keyword": "server identified", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "server receives requests and processes them", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "client identified", "found": true or false, "feedback": "one sentence explanation" }, "mark_4": { "earned": true or false, "keyword": "client sends request and displays or outputs the response", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-11-MJ24-Q5c-i",
    label: "Question 5(c)(i)",
    paper_ref: "9618/11 · May/Jun 2024",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "The bank's network has a firewall. Explain how a firewall can help protect the customers' data.",
    total_marks: 3,
    response_schema: SCHEMA_3,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Explain how a firewall can help protect customers' data.

Mark scheme — any three of the following:
- B1: compares all incoming and outgoing transmissions against set criteria or a whitelist or blacklist
- B1: blocks all transmissions that do not meet the rules OR blocks data entering from specific ports
- B1: blocks unauthorised or unknown internal software transmitting data

Student's answer: ${answer}

Award 1 mark for each distinct valid point up to 3. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "compares transmissions against set criteria / whitelist / blacklist", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "blocks transmissions that do not meet rules / blocks data from specific ports", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "blocks unauthorised internal software transmitting data", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-11-MJ24-Q8b-ii",
    label: "Question 8(b)(ii)",
    paper_ref: "9618/11 · May/Jun 2024",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "Identify two other differences between an IPv4 and IPv6 address.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Identify two differences between an IPv4 and IPv6 address other than the separator character used.

Mark scheme — any two of the following:
- B1: IPv4 has 4 groups of digits whilst IPv6 has 8 groups OR IPv4 is 32 bits whilst IPv6 is 128 bits
- B1: IPv4 is usually represented in denary whilst IPv6 is usually represented in hexadecimal OR IPv4 groups are between 0 and 255 whilst IPv6 groups are between 0 and FFFF

Student's answer: ${answer}

Award 1 mark for each distinct valid difference up to 2. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "IPv4 has 4 groups or 32 bits / IPv6 has 8 groups or 128 bits", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "IPv4 in denary / IPv6 in hexadecimal", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-11-MJ25-Q2a",
    label: "Question 2(a)",
    paper_ref: "9618/11 · May/Jun 2025",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "Explain how data is transferred using real-time bit streaming.",
    total_marks: 4,
    response_schema: SCHEMA_4,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Explain how data is transferred using real-time bit streaming.

Mark scheme — any four of the following:
- B1: video is transmitted continuously as a series of bits
- B1: the video is uploaded to a media server OR users download from the media server
- B1: on download the media server sends the data to a buffer on the user's device OR buffer is used when there is a difference in speed between transmission and receipt
- B1: buffer stores data from server until recipient can receive it OR recipient views bit stream from the buffer

Student's answer: ${answer}

Award 1 mark for each distinct valid point up to 4. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 4], "mark_1": { "earned": true or false, "keyword": "video transmitted continuously as a series of bits", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "uploaded to media server / users download from media server", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "media server sends data to a buffer on the user's device", "found": true or false, "feedback": "one sentence explanation" }, "mark_4": { "earned": true or false, "keyword": "buffer stores data until recipient can receive it / recipient views from buffer", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-11-MJ25-Q2b-i",
    label: "Question 2(b)(i)",
    paper_ref: "9618/11 · May/Jun 2025",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "Explain the reasons why a video is compressed before it is transmitted using real-time bit streaming.",
    total_marks: 4,
    response_schema: SCHEMA_4,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Explain the reasons why a video is compressed before it is transmitted using real-time bit streaming.

Mark scheme — any four of the following:
- B1: video is data-intensive
- B1: the file size needs reducing in order to reduce the amount of bandwidth used
- B1: and reduce buffering OR so people are not behind in the conversation
- B1: and people with lower bandwidth can still take part

Student's answer: ${answer}

Award 1 mark for each distinct valid point up to 4. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 4], "mark_1": { "earned": true or false, "keyword": "video is data-intensive", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "file size reduced to reduce bandwidth used", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "reduces buffering / people not behind in conversation", "found": true or false, "feedback": "one sentence explanation" }, "mark_4": { "earned": true or false, "keyword": "people with lower bandwidth can still take part", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-11-MJ25-Q2b-ii",
    label: "Question 2(b)(ii)",
    paper_ref: "9618/11 · May/Jun 2025",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "Identify whether the lossy or lossless compression method is more appropriate for real-time bit streaming. Justify your answer.",
    total_marks: 3,
    response_schema: SCHEMA_3,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Identify whether lossy or lossless compression is more appropriate for real-time bit streaming. Justify your answer.

Mark scheme:
- B1 mark 1: lossy is most appropriate — no mark for choice alone
- B1 mark 2: reduces file size more than lossless OR significantly less bandwidth or data needed OR buffering reduced even more than with lossless
- B1 mark 3: data can be removed which cannot be seen OR reducing quality without impacting experience OR for example resolution of video can be reduced OR sample rate of audio can be reduced

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "lossy compression identified as most appropriate", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "reduces file size more than lossless / less bandwidth needed / less buffering", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "data removed cannot be seen / quality reduced without impacting experience / video resolution or audio sample rate reduced", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-13-ON24-Q9a",
    label: "Question 9(a)",
    paper_ref: "9618/13 · Oct/Nov 2024",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "Describe the characteristics of a WAN.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Describe the characteristics of a WAN.

Mark scheme:
- B1 mark 1: a WAN covers a large geographical area
- B1 mark 2: external or public infrastructure is used OR non-dedicated hardware

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "covers a large geographical area", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "external or public infrastructure used / non-dedicated hardware", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-13-ON24-Q9c",
    label: "Question 9(c)",
    paper_ref: "9618/13 · Oct/Nov 2024",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "Explain how bit streaming is used in a real-time video conference.",
    total_marks: 4,
    response_schema: SCHEMA_4,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Explain how bit streaming is used in a real-time video conference.

Mark scheme — any four of the following:
- B1: data is compressed before transmitting
- B1: the video and audio are transmitted continuously as a series of bits OR the video is uploaded to a media server
- B1: on download the media server sends the data to a buffer OR the buffer stores data from the server until the receiving device can process it
- B1: the receiving device receives the bit stream from the buffer

Student's answer: ${answer}

Award 1 mark for each distinct valid point up to 4. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 4], "mark_1": { "earned": true or false, "keyword": "data is compressed before transmitting", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "video and audio transmitted continuously as series of bits / uploaded to media server", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "media server sends data to buffer / buffer stores data until device can process it", "found": true or false, "feedback": "one sentence explanation" }, "mark_4": { "earned": true or false, "keyword": "receiving device receives bit stream from the buffer", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-13-ON24-Q9d-i",
    label: "Question 9(d)(i)",
    paper_ref: "9618/13 · Oct/Nov 2024",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "A router has a public IP address and a private IP address. State the purpose of a public IP address and a private IP address.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: State the purpose of a public IP address and a private IP address on a router.

Mark scheme:
- B1 mark 1: public IP address — so that the router is visible to the internet or external network or WAN
- B1 mark 2: private IP address — so that the router is identified to computers within the LAN

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "public IP — router visible to the internet / external network / WAN", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "private IP — router identified to computers within the LAN", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-13-ON24-Q9d-ii",
    label: "Question 9(d)(ii)",
    paper_ref: "9618/13 · Oct/Nov 2024",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "The LAN uses subnetting. Describe the purpose of subnetting in a network.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Describe the purpose of subnetting in a network.

Mark scheme:
- B1 mark 1: allows the network to be divided into smaller networks OR reduces traffic in some parts of the network OR reduces congestion
- B1 mark 2: because traffic only travels through the parts necessary OR hides the complexity of the network OR allows for easier maintenance

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "divides network into smaller networks / reduces traffic or congestion", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "traffic only travels through necessary parts / hides complexity / easier maintenance", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-13-MJ24-Q5a-i",
    label: "Question 5(a)(i)",
    paper_ref: "9618/13 · May/Jun 2024",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "A company has private cloud storage for its employees. Define the term private cloud.",
    total_marks: 1,
    response_schema: SCHEMA_1,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Define the term private cloud.

Mark scheme:
- B1 mark 1: dedicated or bespoke services or storage on a remote server only available to the company

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "dedicated services or storage on a remote server only available to the organisation", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-13-MJ24-Q5a-ii",
    label: "Question 5(a)(ii)",
    paper_ref: "9618/13 · May/Jun 2024",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "Describe the benefits to the company of using private cloud storage instead of public cloud storage.",
    total_marks: 3,
    response_schema: SCHEMA_3,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Describe the benefits to a company of using private cloud storage instead of public cloud storage.

Mark scheme — any three of the following:
- B1: not reliant on a third party
- B1: gives greater control over security or privacy OR gives greater control over backup
- B1: storage can be tailored or scalable to company requirements OR an example such as amount of storage accessible or facilitating sharing of files

Student's answer: ${answer}

Award 1 mark for each distinct valid point up to 3. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 3], "mark_1": { "earned": true or false, "keyword": "not reliant on a third party", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "greater control over security or privacy or backup", "found": true or false, "feedback": "one sentence explanation" }, "mark_3": { "earned": true or false, "keyword": "storage tailored or scalable to company requirements", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-13-MJ24-Q5b",
    label: "Question 5(b)",
    paper_ref: "9618/13 · May/Jun 2024",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "Part of the internal structure of the wired LAN is a star topology. Explain how packets are transmitted between two devices in a star topology.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Explain how packets are transmitted between two devices in a star topology.

Mark scheme:
- B1 mark 1: sending computer transmits packets directly to the switch or router or central device
- B1 mark 2: the switch or router checks the destination address of the packet and forwards directly to that device

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "sending computer transmits packets to switch or router or central device", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "switch or router checks destination address and forwards directly to that device", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-13-MJ24-Q5c-i",
    label: "Question 5(c)(i)",
    paper_ref: "9618/13 · May/Jun 2024",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "A collision is detected in a network using CSMA/CD. Describe how the collision is managed.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Describe how a collision is managed using CSMA/CD.

Mark scheme:
- B1 mark 1: jamming signal is transmitted by the sending device OR transmission is aborted
- B1 mark 2: the sending device waits a random time before trying to send data again OR if further collisions occur the wait time is increased

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "jamming signal transmitted / transmission aborted", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "device waits a random time before retrying / wait time increases with further collisions", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-13-MJ24-Q5c-ii",
    label: "Question 5(c)(ii)",
    paper_ref: "9618/13 · May/Jun 2024",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "Identify two drawbacks of using CSMA/CD.",
    total_marks: 2,
    response_schema: SCHEMA_2,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: Identify two drawbacks of using CSMA/CD.

Mark scheme — any two of the following:
- B1: random time increased each time so can be infinite waiting OR may be constant jamming signal so nothing ever sends OR certain nodes cannot be prioritised
- B1: high power consumption OR only suitable for short distance network OR limited distance OR not scalable OR more nodes means exponentially longer waiting times

Student's answer: ${answer}

Award 1 mark for each distinct valid drawback up to 2. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 2], "mark_1": { "earned": true or false, "keyword": "infinite waiting / constant jamming / nodes cannot be prioritised", "found": true or false, "feedback": "one sentence explanation" }, "mark_2": { "earned": true or false, "keyword": "high power consumption / limited distance / not scalable / more nodes means longer waits", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
  {
    id: "9618-13-MJ24-Q5d",
    label: "Question 5(d)",
    paper_ref: "9618/13 · May/Jun 2024",
    topic: "Networks and the Internet",
    topic_key: "networks_and_the_internet",
    text: "The devices in the office have static private IP addresses. State what is meant by a static private IP address.",
    total_marks: 1,
    response_schema: SCHEMA_1,
    prompt: (answer) => `You are a Cambridge A Level Computer Science examiner. A student has answered the following question:

Question: State what is meant by a static private IP address.

Mark scheme:
- B1 mark 1: static means the IP address for that device does not change AND private means it can only be accessed or seen or used within the LAN

Student's answer: ${answer}

Analyse the student's answer against the mark scheme. Respond in the following JSON format only, no extra text:
{ "marks_earned": [number out of 1], "mark_1": { "earned": true or false, "keyword": "static means IP does not change AND private means only accessible within the LAN", "found": true or false, "feedback": "one sentence explanation" }, "cambridge_insight": "two to three sentences explaining what Cambridge is looking for and why, written in an encouraging but precise tone", "next_step": "one sentence telling the student exactly what to focus on in their next attempt" }`,
  },
];

const INDEX_KEY = "cs_networks_question_index";

export function getNextNetworksQuestion() {
  const idx = parseInt(sessionStorage.getItem(INDEX_KEY) ?? "0", 10) % NETWORKS_QUESTIONS.length;
  return { question: NETWORKS_QUESTIONS[idx], idx, total: NETWORKS_QUESTIONS.length };
}

export function advanceNetworksIndex() {
  const idx = parseInt(sessionStorage.getItem(INDEX_KEY) ?? "0", 10);
  sessionStorage.setItem(INDEX_KEY, String(idx + 1));
}