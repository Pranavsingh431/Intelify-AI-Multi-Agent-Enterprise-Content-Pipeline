from services.compliance import run_compliance_check
from services.llm import generate_content
from services.transform import transform_content


def content_agent(input_text: str) -> dict:
    output = generate_content(input_text)

    return {
        "agent": "content_agent",
        "input": input_text,
        "output": output,
    }


def compliance_agent(content: str) -> dict:
    result = run_compliance_check(content)

    return {
        "agent": "compliance_agent",
        "input": content,
        "output": result,
    }


def localization_agent(content: str) -> dict:
    localized_output = transform_content(content)

    return {
        "agent": "localization_agent",
        "input": content,
        "output": localized_output,
    }


def run_pipeline(user_input: str) -> dict:
    logs = []

    content_step = content_agent(user_input)
    logs.append(content_step)

    generated_content = content_step["output"]

    compliance_step = compliance_agent(generated_content)
    logs.append(compliance_step)

    localization_step = localization_agent(generated_content)
    logs.append(localization_step)

    return {
        "generated_content": generated_content,
        "compliance": compliance_step["output"],
        "localization": localization_step["output"],
        "logs": logs,
    }
