export const LANGUAGE_VERSIONS = {
  javascript: "18.15.0",
  python: "3.10.0",
  java: "15.0.2",
  cpp: "10.2.0",
  csharp: "6.12.0",
  php: "8.2.3",
  text: "",
  json: "",
}

export const CODE_SNIPPETS = {
  javascript: `const generateRandomNumber = () => {\n\treturn Math.floor(Math.random() * 100);\n};\n\nconsole.log("Random Number: " + generateRandomNumber());\n`,
  python: `import random\n\ndef generate_random_number():\n\treturn random.randint(0, 100)\n\nprint("Random Number:", generate_random_number())\n`,
  java: `public class RandomNumberGenerator {\n\tpublic static void main(String[] args) {\n\t\tint randomNumber = (int)(Math.random() * 100);\n\t\tSystem.out.println("Random Number: " + randomNumber);\n\t}\n}\n`,
  csharp: `using System;\n\nnamespace RandomNumberGenerator\n{\n\tclass Program {\n\t\tstatic void Main(string[] args) {\n\t\t\tRandom random = new Random();\n\t\t\tint randomNumber = random.Next(0, 100);\n\t\t\tConsole.WriteLine("Random Number: " + randomNumber);\n\t\t}\n\t}\n}\n`,
  php: `<?php\n\nfunction generateRandomNumber() {\n\treturn rand(0, 100);\n}\n\necho "Random Number: " . generateRandomNumber();\n`,
  cpp: `#include <iostream>\n#include <cstdlib>\n#include <ctime>\n\nint main() {\n\tsrand(static_cast<unsigned>(time(0)));\n\tint randomNumber = rand() % 100;\n\tstd::cout << "Random Number: " << randomNumber << std::endl;\n\treturn 0;\n}\n`,
  text: "",
  json: "",
}

export const LANGUAGE_EXTENSIONS = {
  javascript: "js",
  python: "py",
  java: "java",
  cpp: "cpp",
  csharp: "cs",
  php: "php",
  text: "txt",
  json: "json",
}

