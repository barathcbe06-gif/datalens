import sys

def main():
    if len(sys.argv) < 2:
        print("Usage: python write_file.py <dest_path>")
        sys.exit(1)
    dest_path = sys.argv[1]
    content = sys.stdin.read()
    with open(dest_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Successfully wrote {len(content)} characters to {dest_path}")

if __name__ == "__main__":
    main()
