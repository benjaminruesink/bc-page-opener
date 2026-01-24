table 50101 "Payment Terms"
{
    DataClassification = CustomerContent;
    Caption = 'Payment Terms';
    LookupPageID = 50102;
    DrillDownPageId = 50102;

    fields
    {
        field(1; "Code"; Code[20])
        {
            Caption = 'Code';
        }
        field(2; Description; Text[100])
        {
            Caption = 'Description';
        }
        field(3; "Due Date Calculation"; DateFormula)
        {
            Caption = 'Due Date Calculation';
        }
    }

    keys
    {
        key(PK; "Code")
        {
            Clustered = true;
        }
    }
}
