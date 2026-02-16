def handle_formatted_number(value: str):
    try:
        return int(value.replace(",", ""))
    except ValueError:
        return "0"
