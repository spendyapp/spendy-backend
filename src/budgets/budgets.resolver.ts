import { Inject, UseGuards } from '@nestjs/common'
import {
    Args,
    Mutation,
    Parent,
    Query,
    ResolveField,
    Resolver,
} from '@nestjs/graphql'
import { Aggregate, Expense } from 'src/expenses/expense.schema'
import { ExpensesService } from 'src/expenses/expenses.service'
import { GqlAuthGuard } from '../authz/gqlauth.guard'
import { BudgetDto } from './budget.dto'
import { Budget, BudgetDocument } from './budget.schema'
import { BudgetsService } from './budgets.service'

@Resolver(() => Budget)
export class BudgetsResolver {
    constructor(
        @Inject(BudgetsService) private budgetsService: BudgetsService,
        @Inject(ExpensesService) private expensesService: ExpensesService,
    ) {}

    @ResolveField(() => [Expense])
    @UseGuards(GqlAuthGuard)
    async expenses(
        @Parent() budget: BudgetDocument,
        @Args('startDate') startDate: Date,
        @Args('endDate') endDate: Date,
    ) {
        const { id } = budget
        return this.expensesService.findByBudget(id, startDate, endDate)
    }

    @ResolveField(() => [Aggregate])
    @UseGuards(GqlAuthGuard)
    async sum(
        @Parent() budget: BudgetDocument,
        @Args('startDate') startDate: Date,
        @Args('endDate') endDate: Date,
    ) {
        const { id } = budget
        return this.expensesService.budgetSum(id, startDate, endDate)
    }

    @Query(() => [Budget])
    @UseGuards(GqlAuthGuard)
    async budgets(): Promise<Budget[]> {
        return await this.budgetsService.findAll()
    }

    @Query(() => [Budget])
    @UseGuards(GqlAuthGuard)
    async activeBudgets(): Promise<Budget[]> {
        return await this.budgetsService.findActive()
    }

    @Query(() => Budget)
    @UseGuards(GqlAuthGuard)
    async budget(@Args('id') id: string): Promise<Budget> {
        return await this.budgetsService.find(id)
    }

    @Mutation(() => Budget)
    @UseGuards(GqlAuthGuard)
    async createBudget(
        @Args('name') name: string,
        @Args('amount') amount: number,
        @Args('startDate') startDate: Date,
        @Args('endDate', { nullable: true }) endDate: Date,
        @Args('showInMenu') showInMenu: boolean,
        @Args('sortOrder') sortOrder: number,
    ): Promise<Budget> {
        const budgetDto: BudgetDto = new BudgetDto()
        budgetDto.name = name
        budgetDto.amount = amount
        budgetDto.startDate = startDate
        budgetDto.endDate = endDate
        budgetDto.showInMenu = showInMenu
        budgetDto.sortOrder = sortOrder
        return await this.budgetsService.create(budgetDto)
    }

    @Mutation(() => Budget)
    @UseGuards(GqlAuthGuard)
    async updateBudget(
        @Args('id') id: string,
        @Args('name') name: string,
        @Args('amount') amount: number,
        @Args('startDate') startDate: Date,
        @Args('endDate', { nullable: true }) endDate: Date,
        @Args('showInMenu') showInMenu: boolean,
        @Args('sortOrder') sortOrder: number,
    ): Promise<Budget> {
        const budgetDto: BudgetDto = new BudgetDto()
        budgetDto.name = name
        budgetDto.amount = amount
        budgetDto.startDate = startDate
        budgetDto.endDate = endDate
        budgetDto.showInMenu = showInMenu
        budgetDto.sortOrder = sortOrder
        return await this.budgetsService.update(id, budgetDto)
    }

    @Mutation(() => Budget)
    @UseGuards(GqlAuthGuard)
    async deleteBudget(@Args('id') id: string): Promise<Budget> {
        return await this.budgetsService.delete(id)
    }
}
