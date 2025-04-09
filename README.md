# Poker Challenge

Poker Challenge is a simple 5-card poker-style game built entirely with HTML, CSS, and JavaScript. It is designed to be visually intuitive so that both players and onlookers can easily understand the hand rankings and overall gameplay. This project demonstrates the core concepts of poker hand evaluation and betting, featuring an adjustable CPU difficulty setting that influences the computer opponent’s decision-making.

## Features

- **5-Card Poker Gameplay**  
  Both the player and the computer (CPU) are dealt five cards from a standard 52-card deck. Hands are evaluated based on traditional poker rankings such as One Pair, Two Pair, Three of a Kind, Full House, Straight, Flush, and more.

- **Visual Card Display**  
  Cards are rendered with a clean, card-like interface. Hearts and Diamonds are displayed in red for easy differentiation.

- **Hand Evaluation**  
  Both the player's and CPU's hands are evaluated and displayed clearly so that anyone can quickly understand the strength of each hand.

- **CPU Difficulty Control**  
  An interactive slider lets you adjust the CPU's difficulty. With higher difficulty settings, the CPU will play more aggressively (raising with a wider range of hands).

- **Simple Betting System**  
  The pot size is determined based on the actions (Raise or Call) chosen by both the player and the CPU. The coin balance is updated accordingly, starting with an initial 100 coins.

- **Responsive Design**  
  The user interface is built to work well on both desktop and mobile browsers.

## How to Play

1. **Start a New Round**  
   Click the **New Round** button. Both you and the CPU will be dealt five cards from a shuffled deck.

2. **Review Your Hand**  
   Your hand is displayed along with an automatic evaluation (e.g., "One Pair" or "Flush"). Use this information to decide your next move.

3. **CPU Strategy**  
   The CPU’s hand remains hidden until you make your decision. Its potential action (Raise or Call) is determined by its hand’s strength and the selected CPU difficulty.

4. **Choose Your Action**  
   Decide whether to **Raise** or **Call** based on your hand’s evaluation.

5. **Showdown**  
   After your choice, the CPU’s hand is revealed, and the outcome is determined by comparing hand evaluations.

6. **Betting Outcome**  
   Depending on both players’ actions and the showdown result, your coin balance will update. The game starts with 100 coins.

## File Structure

Below is the project file structure. The `<pre>` tag ensures that the entire structure displays as one preformatted block:

<pre>
.
├── index.html          # Main HTML file containing the structure of the page
└── assets
    ├── css
    │   └── style.css   # Stylesheet for layout, card design, and responsiveness
    └── js
        └── main.js     # Game logic: deck creation, shuffling, hand evaluation, and user interactions
</pre>

## Requirements

- A modern web browser (Chrome, Firefox, Safari, Edge, etc.)
- No additional libraries are required since the game uses plain HTML, CSS, and JavaScript.

## Setup and Usage

1. **Clone or Download** the repository:
    ```bash
    git clone <repository_url>
    ```

2. **Open** the `index.html` file in your web browser.

3. Adjust the **CPU Difficulty** slider to modify the computer opponent’s behavior.

4. Click **New Round** to start the game and then select **Raise** or **Call** based on your hand evaluation.

## Customization

- **Visual Appearance**  
  Modify `assets/css/style.css` to change the appearance of the cards and overall layout.

- **Game Logic**  
  Tweak `assets/js/main.js` to adjust poker rules, hand evaluation logic, or betting mechanisms.

- **Deployment**  
  This project is well-suited for deployment on static hosting services such as GitHub Pages.

## Acknowledgements

This project is a fun demonstration of how to create an interactive game using basic web technologies. Feel free to fork, modify, and extend it as needed.

## License

This project is open-source and available under the [MIT License](LICENSE).
