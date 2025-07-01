
-- Insert sample workflow templates to make the system functional
INSERT INTO workflow_templates (name, type, definition, active) VALUES 
(
  'Marketing Expense Approval',
  'expense_approval',
  '{
    "steps": [
      {
        "id": "manager-approval",
        "name": "Manager Approval",
        "type": "approval",
        "role": "manager"
      },
      {
        "id": "finance-approval", 
        "name": "Finance Director Approval",
        "type": "approval",
        "role": "finance_director",
        "conditions": [
          {
            "field": "amount",
            "operator": ">",
            "value": 1000
          }
        ]
      }
    ]
  }'::jsonb,
  true
),
(
  'Campaign Approval',
  'campaign_approval', 
  '{
    "steps": [
      {
        "id": "marketing-manager-approval",
        "name": "Marketing Manager Approval",
        "type": "approval",
        "role": "marketing_manager"
      },
      {
        "id": "finance-approval",
        "name": "Finance Director Approval", 
        "type": "approval",
        "role": "finance_director",
        "conditions": [
          {
            "field": "amount",
            "operator": ">",
            "value": 5000
          }
        ]
      }
    ]
  }'::jsonb,
  true
);
