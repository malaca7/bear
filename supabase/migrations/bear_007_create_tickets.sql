-- ========================================================
-- BEAR Platform - Tickets & Support
-- ========================================================

CREATE TABLE IF NOT EXISTS bear_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number SERIAL,
    user_id UUID NOT NULL REFERENCES bear_users(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES bear_users(id),
    subject VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    status bear_ticket_status NOT NULL DEFAULT 'open',
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    category VARCHAR(100),
    tags JSONB DEFAULT '[]',
    is_read_by_admin BOOLEAN NOT NULL DEFAULT false,
    is_read_by_client BOOLEAN NOT NULL DEFAULT true,
    closed_at TIMESTAMPTZ,
    closed_by UUID REFERENCES bear_users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bear_ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES bear_tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES bear_users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    is_internal BOOLEAN NOT NULL DEFAULT false,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bear_tickets_user ON bear_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_bear_tickets_status ON bear_tickets(status);
CREATE INDEX IF NOT EXISTS idx_bear_tickets_assigned ON bear_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_bear_tickets_number ON bear_tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_bear_ticket_messages_ticket ON bear_ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_bear_ticket_messages_user ON bear_ticket_messages(user_id);
