import { App, ExpressReceiver, View } from '@slack/bolt';
import dotenv from 'dotenv';
import { handleCreateTicket } from './slackHandler';

dotenv.config();

const modalView = {
  type: 'modal',
  callback_id: 'create_ticket_submission',
  title: {
    type: 'plain_text',
    text: 'Create Jira Ticket'
  },
  submit: {
    type: 'plain_text',
    text: 'Submit'
  },
  close: {
    type: 'plain_text',
    text: 'Cancel'
  },
  blocks: [
    {
      "type": "input",
      "block_id": "issuetype_block",
      "label": {
        "type": "plain_text",
        "text": "Work Type"
      },
      "element": {
        "type": "static_select",
        "action_id": "issuetype_action",
        "placeholder": {
          "type": "plain_text",
          "text": "Select a work type"
        },
        "options": [
          {
            "text": {
              "type": "plain_text",
              "text": "Bug"
            },
            "value": "10300"  
          },
          {
            "text": {
              "type": "plain_text",
              "text": "Enhancement"
            },
            "value": "10304"  
          },
          {
            "text": {
              "type": "plain_text",
              "text": "Task"
            },
            "value": "10302"  
          },
          {
            "text": {
              "type": "plain_text",
              "text": "Story"
            },
            "value": "10306"  
          },
          {
            "text": {
              "type": "plain_text",
              "text": "Release"
            },
            "value": "10301"  
          },
          {
            "text": {
              "type": "plain_text",
              "text": "Epic"
            },
            "value": "10311"
          }
        ]
      }
    },    
    {
      type: 'input',
      block_id: 'summary_block',
      label: { type: 'plain_text', text: 'Summary' },
      element: {
        type: 'plain_text_input',
        action_id: 'summary_input'
      }
    },
    {
      type: 'input',
      block_id: 'description_block',
      label: { type: 'plain_text', text: 'Description' },
      element: {
        type: 'plain_text_input',
        multiline: true,
        action_id: 'description_input'
      }
    },
    {
      type: 'input',
      block_id: 'priority_block',
      label: { type: 'plain_text', text: 'Priority' },
      element: {
        type: 'static_select',
        action_id: 'priority_input',
        options: [
          {
            text: { type: 'plain_text', text: 'Medium-P2' },
            value: 'Medium-P2'
          },
          {
            text: { type: 'plain_text', text: 'Highest-P0' },
            value: 'Highest-P0'
          },
          {
            text: { type: 'plain_text', text: 'High-P1' },
            value: 'High-P1'
          },
          {
            text: { type: 'plain_text', text: 'Low-P3' },
            value: 'Low-P3'
          }
        ]
      }
    },
    {
      type: 'input',
      block_id: 'brand_block',
      label: { type: 'plain_text', text: 'Brand' },
      element: {
        type: 'static_select',
        action_id: 'brand_input',
        options: [
          {
            text: { type: 'plain_text', text: 'Abbott_HK_Demo' },
            value: 'Abbott_HK_Demo'
          },
          {
            text: { type: 'plain_text', text: 'Abbott' },
            value: 'Abbott'
          },
          {
            text: { type: 'plain_text', text: 'Aape' },
            value: 'Aape'
          }
        ]
      }
    },
    {
      type: 'input',
      block_id: 'env_block',
      label: { type: 'plain_text', text: 'Environment' },
      element: {
        type: 'static_select',
        action_id: 'env_input',
        options: [
          {
            text: { type: 'plain_text', text: 'Prod' },
            value: 'Prod'
          },
          {
            text: { type: 'plain_text', text: 'UAT' },
            value: 'UAT'
          },
          {
            text: { type: 'plain_text', text: 'Go-Live' },
            value: 'Go-Live'
          },
          {
            text: { type: 'plain_text', text: 'Demo' },
            value: 'Demo'
          }
        ]
      }
    },
    {
      type: 'input',
      block_id: 'component_block',
      label: { type: 'plain_text', text: 'Components' },
      element: {
        type: 'static_select',
        action_id: 'component_input',
        options: [
          {
            text: { type: 'plain_text', text: 'API' },
            value: 'API'
          },
          {
            text: { type: 'plain_text', text: 'alerts' },
            value: 'alerts'
          },
          {
            text: { type: 'plain_text', text: 'artificial intelligence' },
            value: 'artificial intelligence'
          }
        ]
      }
    },

  ]
};

// Create a custom ExpressReceiver to attach Express to the Bolt app
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET!,
  endpoints: {
    events: '/slack/events',
    commands: '/slack/commands',
  },
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  receiver
});


app.view('create_ticket_submission', async ({ ack, view, body, client }) => {
  console.log("🟢 Got a modal submission:", view.callback_id); 
  try {
    await ack(); // Always ack early

    const values = view.state.values;
    const issuetype:any = view.state.values.issuetype_block.issuetype_action.selected_option?.value;
    const summary:any = values.summary_block.summary_input.value;
    const description:any = values.description_block.description_input.value;
    const priority:any = values.priority_block.priority_input.selected_option?.value;
    const brand:any = values.brand_block.brand_input.selected_option?.value;
    const environment:any = values.env_block.env_input.selected_option?.value;
    const components:any = values.component_block.component_input.selected_option?.value;

    const response = await handleCreateTicket(issuetype,summary, description, priority, brand, environment, components);

    // Optional: send user confirmation
    await client.chat.postMessage({
      channel: body.user.id,
      text: response
    });

  } catch (error) {
    console.error('Error in view submission handler:', error);

    // Optional: notify user something broke
    await client.chat.postMessage({
      channel: body.user.id,
      text: '❌ Something went wrong while creating your Jira ticket.'
    });
  }
});


app.command('/new-pain', async ({ command, ack, client }) => {
  
  await ack();

  await client.views.open({
    trigger_id: command.trigger_id,
    view: {...modalView} as View, 
  });

});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Slack Bolt app is running!');
})();
