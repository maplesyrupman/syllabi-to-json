// import OpenAI from "openai";
// import fs from 'fs/promises'

const OpenAI = require('openai')
const fs = require('fs').promises

const openai = new OpenAI({apiKey: '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' })

async function main(inputPath, outputPath) {
    const txtSyllabus = await fs.readFile(inputPath, 'utf8')
    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: "system",
                content: `I am going to provide you a text file of a university syllabus. I need you to extract the following information: 

        - Course Code
        - An abbreviated version of the course title (maximum 8 characters)
        - Class days and times (use single letters to represent days separated by a slash (ex. F for a one day course, M/W for a 2 day course, M/T/Th for a three day course), except for thursday and sunday, then use Th and Su respectively), and separate the start and end times with a hyphen (ex. @ 11:00am – 2:00pm). For example, “T/Th @ 12:45pm – 2:00pm” 
        - Lecture dates, descriptions, and assigned readings
        - Assessment dates and times along with their descriptions and associated grade worth. 
        - Required texts and materials with their titles, authors, and description (publisher, publishing date, etc.) 
        
        The part of the text file that outlines the course (lecture dates and assigned readings) sometimes also includes assessments due that day. Do not get the evaluation or assessment data from this table, but rather the table titled “Evaluation and Assignments” or another similar name. 
        
        Please return the data in JSON format, following this structure: 
        
        {"course-code":"string","title":"string","day-times":"string","lectures":[{"date":"Day, Month Date","description":"string","assigned readings":["string"]}],"assessments":[{"date":"string","time":"string","description":"string","grade-worth":"string"}],"required-materials":[{"title":"string","author":"string","description":"string"}]}`,
            },
            { role: "user", content: txtSyllabus },
        ],
        model: "gpt-3.5-turbo-1106",
        response_format: { type: "json_object" },
    });
    const cleanJson = completion.choices[0].message.content.replace(/\n/g, '')
    const courseObj = JSON.parse(cleanJson)
    await fs.writeFile(outputPath, JSON.stringify(courseObj, null, 2),'utf8')
    console.log(`Wrote json at ${outputPath}`)
}

module.exports = main