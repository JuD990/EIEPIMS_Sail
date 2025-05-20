import React, { useState, useEffect } from "react";

const GraduatingRemarks = ({ onDataChange }) => {
    const initialRemarks = {
        "PGF Specific Remarks": "",
        "School Year Highlight": "",
        "School Year Lowlight": "",
        "Reason for Enrolling in UNC for College": "",
        "After Graduation Plans": "",
        "Use English in all transactions with employees of different offices or units in the University.": { rating: "", explanation: "" },
        "Use English in all Employee-Student conversations.": { rating: "", explanation: "" },
        "Use English in the opening and closing of all Student conversations with campus visitors, supported by the use of native languages such as Bikol or Filipino to facilitate clear and comfortable transactions.": { rating: "", explanation: "" },
        "Use English during classes except in Mother Tongue or Filipino courses.": { rating: "", explanation: "" },
        "Use English during conduct of University activities held outside of the classroom such as programs, games, academic and non-academic student activities, and others.": { rating: "", explanation: "" },
        "Use English during conduct of meetings, conferences, seminars, and workshops held in the University.": { rating: "", explanation: "" },
        "Use English when writing and cascading communications and other relevant information through emails, letters and memoranda.": { rating: "", explanation: "" },
        "Use English during conduct of consultation sessions between students and faculty members.": { rating: "", explanation: "" },
        "Use English during informal conversations along corridors, hallways and other places in the University.": { rating: "", explanation: "" },
        "Use English when representing UNC in external functions such as meetings, etc.": { rating: "", explanation: "" },
        "Assist student towards full communication by using the native language in guiding and coaching.": { rating: "", explanation: "" },
        "Use the native language to clarify the understanding of the student.": { rating: "", explanation: "" },
        "In 11 and 12, help student restate her/his context and articulation in English.": { rating: "", explanation: "" },
        "English Immersive Program as part of instructional or facilitating objectives.": { rating: "", explanation: "" },
        "Help students whenever there is a need for them to correct and enhance their pronunciation, grammar, and fluency in the use of the English language.": { rating: "", explanation: "" },
    };

    const [remarks2, setRemarks2] = useState(initialRemarks);

    // Helper to map long keys to snake_case keys matching your Laravel model columns
    const mapKeysToSnakeCase = (data) => {
        return {
            pgf_specific_remarks: data["PGF Specific Remarks"],
            school_year_highlight: data["School Year Highlight"],
            school_year_lowlight: data["School Year Lowlight"],
            reason_for_enrolling: data["Reason for Enrolling in UNC for College"],
            after_graduation_plans: data["After Graduation Plans"],

            transactions_with_employees_rating: data["Use English in all transactions with employees of different offices or units in the University."]?.rating,
            transactions_with_employees_explanation: data["Use English in all transactions with employees of different offices or units in the University."]?.explanation,

            employee_student_conversations_rating: data["Use English in all Employee-Student conversations."]?.rating,
            employee_student_conversations_explanation: data["Use English in all Employee-Student conversations."]?.explanation,

            student_visitor_conversations_rating: data["Use English in the opening and closing of all Student conversations with campus visitors, supported by the use of native languages such as Bikol or Filipino to facilitate clear and comfortable transactions."]?.rating,
            student_visitor_conversations_explanation: data["Use English in the opening and closing of all Student conversations with campus visitors, supported by the use of native languages such as Bikol or Filipino to facilitate clear and comfortable transactions."]?.explanation,

            classes_rating: data["Use English during classes except in Mother Tongue or Filipino courses."]?.rating,
            classes_explanation: data["Use English during classes except in Mother Tongue or Filipino courses."]?.explanation,

            university_activities_rating: data["Use English during conduct of University activities held outside of the classroom such as programs, games, academic and non-academic student activities, and others."]?.rating,
            university_activities_explanation: data["Use English during conduct of University activities held outside of the classroom such as programs, games, academic and non-academic student activities, and others."]?.explanation,

            meetings_and_workshops_rating: data["Use English during conduct of meetings, conferences, seminars, and workshops held in the University."]?.rating,
            meetings_and_workshops_explanation: data["Use English during conduct of meetings, conferences, seminars, and workshops held in the University."]?.explanation,

            written_communications_rating: data["Use English when writing and cascading communications and other relevant information through emails, letters and memoranda."]?.rating,
            written_communications_explanation: data["Use English when writing and cascading communications and other relevant information through emails, letters and memoranda."]?.explanation,

            consultation_sessions_rating: data["Use English during conduct of consultation sessions between students and faculty members."]?.rating,
            consultation_sessions_explanation: data["Use English during conduct of consultation sessions between students and faculty members."]?.explanation,

            informal_conversations_rating: data["Use English during informal conversations along corridors, hallways and other places in the University."]?.rating,
            informal_conversations_explanation: data["Use English during informal conversations along corridors, hallways and other places in the University."]?.explanation,

            external_representation_rating: data["Use English when representing UNC in external functions such as meetings, etc."]?.rating,
            external_representation_explanation: data["Use English when representing UNC in external functions such as meetings, etc."]?.explanation,

            native_language_guidance_rating: data["Assist student towards full communication by using the native language in guiding and coaching."]?.rating,
            native_language_guidance_explanation: data["Assist student towards full communication by using the native language in guiding and coaching."]?.explanation,

            clarify_with_native_language_rating: data["Use the native language to clarify the understanding of the student."]?.rating,
            clarify_with_native_language_explanation: data["Use the native language to clarify the understanding of the student."]?.explanation,

            help_restate_context_rating: data["In 11 and 12, help student restate her/his context and articulation in English."]?.rating,
            help_restate_context_explanation: data["In 11 and 12, help student restate her/his context and articulation in English."]?.explanation,

            immersive_program_rating: data["English Immersive Program as part of instructional or facilitating objectives."]?.rating,
            immersive_program_explanation: data["English Immersive Program as part of instructional or facilitating objectives."]?.explanation,

            help_correct_english_usage_rating: data["Help students whenever there is a need for them to correct and enhance their pronunciation, grammar, and fluency in the use of the English language."]?.rating,
            help_correct_english_usage_explanation: data["Help students whenever there is a need for them to correct and enhance their pronunciation, grammar, and fluency in the use of the English language."]?.explanation,
        };
    };

    const handleChange = (e, key) => {
        const updated = typeof remarks2[key] === "object"
        ? { ...remarks2, [key]: { ...remarks2[key], explanation: e.target.value } }
        : { ...remarks2, [key]: e.target.value };
        setRemarks2(updated);
    };

    const handleDropdownChange = (e, key) => {
        const updated = {
            ...remarks2,
            [key]: { ...remarks2[key], rating: e.target.value }
        };
        setRemarks2(updated);
    };

    useEffect(() => {
        if (onDataChange) {
            onDataChange(mapKeysToSnakeCase(remarks2)); // send mapped data here
        }
    }, [remarks2, onDataChange]);

    const unnumberedKeys = new Set([
        "PGF Specific Remarks",
        "School Year Highlight",
        "School Year Lowlight",
        "Reason for Enrolling in UNC for College",
        "After Graduation Plans"
    ]);

    let counter = 1;

    return (
        <div>
        <h2 className="text-xl font-bold mb-4">Graduating Student Remarks</h2>
        {Object.entries(remarks2).map(([key, value]) => {
            const isObject = typeof value === "object";
            const label = unnumberedKeys.has(key) ? key : `${counter++}. ${key}`;
            return (
                <div key={key} className="mb-4">
                <label className="block font-semibold">{label}</label>
                {isObject ? (
                    <div className="flex flex-col md:flex-row gap-4 mt-2">
                    <select
                    value={value.rating}
                    onChange={(e) => handleDropdownChange(e, key)}
                    className="p-2 border border-gray-300 rounded w-48"
                    >
                    <option value="">Rate (1–10)</option>
                    {Array.from({ length: 10 }, (_, i) => (
                        <option key={i} value={i + 1}>
                        {i + 1}
                        </option>
                    ))}
                    </select>
                    <textarea
                    value={value.explanation}
                    onChange={(e) => handleChange(e, key)}
                    className="flex-1 p-2 border border-gray-300 rounded"
                    rows={2}
                    placeholder="Explain your rating here..."
                    disabled={!value.rating}
                    />
                    </div>
                ) : (
                    <textarea
                    value={value}
                    onChange={(e) => handleChange(e, key)}
                    className="w-full p-2 border border-gray-300 rounded mt-2"
                    rows={2}
                    />
                )}
                </div>
            );
        })}
        </div>
    );
};

export default GraduatingRemarks;
