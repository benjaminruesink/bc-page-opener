page 50100 "Customer API"
{
    PageType = API;
    Caption = 'Customer API';
    APIPublisher = 'contoso';
    APIGroup = 'sales';
    APIVersion = 'v1.0';
    EntityName = 'customer';
    EntitySetName = 'customers';
    SourceTable = Customer;
    ApplicationArea = All;
    InsertAllowed = false;
    ModifyAllowed = false;
    DeleteAllowed = false;
    ODataKeyFields = SystemId;

    layout
    {
        area(Content)
        {
            repeater(GroupName)
            {
                field(no; Rec."No.")
                {
                }
                field(name; Rec.Name)
                {
                }
            }
        }
    }
}
