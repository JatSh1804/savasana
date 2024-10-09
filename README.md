# Customizable GPT Chat Application

This project is a customizable GPT-based chat application designed to support advanced conversation branching, user message editing, and session traversal. It’s built using Next.js, TypeScript, and Supabase as the backend, with the flexibility to integrate with various AI models, including those provided by Ollama.

The core challenge was to develop an architecture that can handle branching in conversations, allowing users to edit previous messages and create different paths within a chat session.

## Features

### 1. **Message Editing and Branching**
   - **Multiple Edits**: Users can edit any previous message, even if it’s not the last one. Upon editing, a new branch is created for the chat, while preserving the original branch. Repeated edits create additional branches, enabling complex chat paths.
   - **Branch Creation on Edit**: Each time a message is edited, the original branch forks into two sub-branches. The original message is assigned to one branch, and the newly edited message starts the other branch.
   - **Conversation Traversal**: Users can navigate between different conversation branches. Buttons allow users to switch between branches of the conversation, with the full message tree retrieved and displayed to the user.

### 2. **Sub-Branch Traversal**
   - **Child Branch Navigation**: If a branch has sub-branches, the system traverses all child branches and displays the entire conversation tree. The `children` field in the `user_chat_branches` table tracks sub-branches, allowing full traversal from top to bottom of the conversation tree.

### 3. **Persistent Sessions**
   - **Session Branch Storage**: Session states are stored and managed efficiently using a `sessionBranches` object. Each branch is stored by its ID, allowing for quick retrieval and rendering of branches and their associated messages.

### 4. **Branch Navigation UI**
   - **Branch Switching**: Users can switch between different branches of a conversation using navigation buttons displayed on messages that have multiple branches. The system retrieves the message tree from the active branch and displays it, allowing users to explore different conversational paths.

### 5. **Indexing and Chat Pathing**
   - **Chat Path Indexing**: Each branch in a conversation is indexed, and users can toggle between different chat index paths. This allows users to continue the conversation on any branch and explore different outcomes.
   - **Root and Leaf Branches**: Branch navigation starts from the root branch, and the system can traverse from parent to child branches to display the complete conversation history. 

### 6. **Efficient State Management**
   - **Stateful UI Updates**: The UI is built with efficient state management to ensure that messages are updated dynamically as users switch between branches. The `children` field is used to traverse child branches and ensure that all messages in the conversation tree are displayed correctly.

### 7. **Ollama Model Integration**
   - **Model Flexibility**: The application is designed to integrate easily with various GPT models, including those provided by Ollama. You can customize the chat experience by connecting different AI models based on specific use cases.
   - **API Integration**: The chat application can send prompts to and receive responses from Ollama models, ensuring that responses are contextually relevant and aligned with the user's conversation history. Simply adjust the API endpoints and authentication as required for the Ollama model.
   
## Technologies and Architecture

### Frontend
- **Next.js**: Next.js is used as the frontend framework, offering server-side rendering, API routes for backend logic, and static page generation. It provides a great foundation for performance and scalability.
- **TypeScript**: TypeScript ensures type safety throughout the application, reducing bugs and improving maintainability. It helps with the development of complex features like branching and message handling by providing robust type definitions.
- **React Hooks**: React hooks like `useState`, `useEffect`, and custom hooks are used for managing the state of chat sessions and branches, allowing for efficient updates as the user interacts with the UI.

### Backend
- **Supabase**: Supabase is used as the backend for database management and real-time functionalities. It stores session data, chat branches, and messages in a relational structure, allowing for complex queries and data retrieval.
    - **PostgreSQL**: The database is PostgreSQL, which supports advanced querying capabilities like recursive queries, array manipulation, and JSON storage, all of which are essential for managing chat branching and traversal.

### Branching Architecture
- **Branch Creation Logic**: The core of the application is the branching logic. Every time a message is edited, a new branch is created, and the original branch is preserved. This branching architecture is stored in the `user_chat_branches` and `branch_messages` tables.
- **Message Traversal**: When a user switches between branches, the system recursively checks for parent and child branches, updating the message list accordingly.
- **Recursive Data Structure**: The recursive nature of chat branches allows for deep traversal, enabling users to explore different versions of the same conversation based on their edits.

### Database Schema
- **Tables**:
  - `user_chats`: Stores general chat session details like session ID and last branch created.
  - `user_chat_branches`: Stores branch information such as branch IDs, parent branch IDs, and children branch IDs.
  - `branch_messages`: Stores individual messages, including their content, sender, timestamp, and associated branch ID. It also tracks related branches using an `other_branches` field.
  
- **Database Functions**:
  - A set of database functions handle the branching logic, including inserting messages into new branches, updating branch arrays, and ensuring that all branches are linked correctly through parent-child relationships.

### Challenges Solved
- **Multi-Turn Chat Branching**: The architecture supports multi-turn conversations with branching at any point in the chat. Users can go back, edit a message, and the system will create a branch and update the conversation tree accordingly.
- **Branch Navigation**: The system allows seamless navigation across branches, displaying the entire chat path for users to explore.
- **Database Efficiency**: PostgreSQL’s array and JSONB support allow for complex data structures to be efficiently stored and retrieved, which is crucial for managing the chat branching system.

## Setup Instructions

### Prerequisites
- Node.js and npm/yarn installed.
- Supabase account set up with the necessary tables and functions created.
- Optional: Ollama API access for model integration.

### Steps to Run Locally

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd <repo-directory>
2. Install dependencies:

   ```bash
   npm install
   ```
3. Set up environment variables:

   Create a .env.local file and add your Supabase keys and any other necessary environment variables, including those required for Ollama model integration:


   ```bash
   NEXT_PUBLIC_SUPABASE_URL=<YOUR_SUPABASE_URL>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY>
   OLLAMA_API_KEY=<YOUR_OLLAMA_API_KEY>
   ```
   Run the development server:

   ```bash
      npm run dev 
   ```

   Access the application at http://localhost:3000.

Conclusion
This project demonstrates a complex yet efficient approach to conversation branching in GPT-based chat applications. By leveraging Next.js, TypeScript, Supabase, and the flexibility to integrate with AI models like Ollama, we have built a scalable and dynamic architecture that allows users to explore different conversational outcomes through a flexible branching system. This approach can easily be extended to support even more advanced features and customizations.

Future Enhancements
Real-time Updates: Implement real-time updates for chat sessions using Supabase’s real-time capabilities.

This version incorporates the integration of Ollama models, outlining how the architect